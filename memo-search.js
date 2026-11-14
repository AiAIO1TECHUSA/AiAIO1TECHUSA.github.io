/* memo-search.js
 * Search for the legal memo page.
 * Expects: #memoSearch (input), .memo-document (content), optional #memoStatus.
 */
(function () {
  'use strict';

  const MIN_CHARS = 3;
  const DEBOUNCE_MS = 150;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'INPUT', 'TEXTAREA', 'MARK']);

  const input = document.getElementById('memoSearch');
  const container = document.querySelector('.memo-document');
  const status = document.getElementById('memoStatus');
  if (!input || !container) return;

  // Minimal highlight styles so this file works without editing the CSS.
  const style = document.createElement('style');
  style.textContent = `
    mark.memo-hit { background: #fff3a3; color: inherit; padding: 0 1px; border-radius: 2px; }
    mark.memo-hit.current { background: #ffb020; outline: 2px solid var(--memo-accent, #2457a6); }
  `;
  document.head.appendChild(style);

  let matches = [];
  let current = -1;
  let timer = null;

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function clearHighlights() {
    const marks = container.querySelectorAll('mark.memo-hit');
    marks.forEach((m) => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    matches = [];
    current = -1;
  }

  function collectTextNodes() {
    const nodes = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function highlight(term) {
    clearHighlights();
    if (term.length < MIN_CHARS) {
      updateStatus(term.length ? `Type at least ${MIN_CHARS} characters` : '');
      return;
    }

    const re = new RegExp(escapeRegex(term), 'gi');

    collectTextNodes().forEach((node) => {
      const text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) return;
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'memo-hit';
        mark.textContent = m[0];
        frag.appendChild(mark);
        matches.push(mark);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });

    if (matches.length) {
      go(0);
    } else {
      updateStatus('No matches');
    }
  }

  function go(index) {
    if (!matches.length) return;
    if (current >= 0 && matches[current]) matches[current].classList.remove('current');
    current = (index + matches.length) % matches.length;
    const el = matches[current];
    el.classList.add('current');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateStatus(`${current + 1} of ${matches.length}`);
  }

  function updateStatus(msg) {
    if (status) status.textContent = msg;
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => highlight(input.value.trim()), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!matches.length) return;
      go(e.shiftKey ? current - 1 : current + 1);
    } else if (e.key === 'Escape') {
      input.value = '';
      clearHighlights();
      updateStatus('');
      input.blur();
    }
  });

  // "/" focuses the search box unless the user is already typing somewhere.
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/') return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
    e.preventDefault();
    input.focus();
    input.select();
  });
})();
