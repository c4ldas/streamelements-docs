// TO DO:
// When on the API page, if we change to light mode, half the page keeps dark mode. Most of the background is dark.
// After a refresh, it goes back to light mode.

import Layout from '@theme/Layout';
import { useEffect, useRef } from 'react';
import '@stoplight/elements/styles.min.css';

// Maps for text color and background color replacements
// Stoplight color -> new color
const textColorMap = {
  'rgb(24, 54, 145)': 'rgba(155, 101, 255, 1)',
  'rgb(111, 66, 193)': 'rgba(155, 101, 255, 1)',
  'rgb(3, 47, 98)': 'rgba(0, 173, 196, 1)',
  'rgb(51, 51, 51)': 'rgb(91, 91, 91)',
  'rgb(0, 92, 197)': 'rgb(0, 119, 255)',
};

const backgroundColorMap = {
  // 'rgb(26, 33, 45)': 'rgb(27, 27, 29)',   // side panel
  // 'rgb(14, 19, 27)': 'rgb(27, 27, 29)',   // main body

  'rgb(26, 33, 45)': 'var(--ifm-background-color)',
  'rgb(14, 19, 27)': 'var(--ifm-background-color)', 
  // 'rgba(21, 130, 193, .25)': 'rgb(21, 130, 193)', // selected item
};


export default function APIReference() {
  const container = useRef(null);

  // custom colour patches
  useRepaintColors(container);
  useSwapPrimaryTint(container);

  // During static/SSR pass we can’t access window, so just show a placeholder
  if (typeof window === 'undefined') {
    return (
      <Layout title="API Reference">
        <p>Loading API Reference…</p>
      </Layout>
    );
  }

  // client-side only
  const { API } = require('@stoplight/elements');

  return (
    <Layout title="API Reference">
      <div
        ref={container}
        id="elements-content"
        style={{ backgroundColor: 'var(--ifm-background-color)' }}
      >
        <API
          apiDescriptionUrl="/api.yaml"
          router="hash"
          layout="sidebar"
          hideSchemas
        />
      </div>
    </Layout>
  );
}


function useRepaintColors(root) {
  useEffect(() => {
    if (!root.current) return;

    const repaint = () => {
      /* 1- repaint everything already inside the map logic */
      root.current.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el)

        const text = cs.color
        if (textColorMap[text]) el.style.color = textColorMap[text]

        const bg = cs.backgroundColor
        if (backgroundColorMap[bg]) el.style.backgroundColor = backgroundColorMap[bg]
      })
    }

    repaint();

    const observer = new MutationObserver(repaint);
    observer.observe(root.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [root]);
}


function useSwapPrimaryTint(root) {
  const prev = useRef(null)

  useEffect(() => {
    const host = root.current
    if (!host) return

    const promote = node => {
      if (prev.current && prev.current !== node) {
        prev.current.style.backgroundColor = 'var(--ifm-background-color)'
      }

      node.classList.remove('sl-bg-primary-tint');
      node.style.backgroundColor = 'var(--ifm-navbar-background-color)';

      prev.current = node
    }

    /* 1 — initial scan (in case it’s already there) */
    host.querySelectorAll('.sl-bg-primary-tint').forEach(promote)

    /* 2 — watch future DOM changes */
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return
          if (n.classList.contains('sl-bg-primary-tint')) promote(n)
          n.querySelectorAll?.('.sl-bg-primary-tint').forEach(promote)
        })
      })
    })
    obs.observe(host, { childList: true, subtree: true })

    /* 3 — update after every click (wait a frame so Stoplight updates first) */
    const onClick = () =>
      requestAnimationFrame(() => {
        const current = host.querySelector('.sl-bg-primary-tint')
        if (current) promote(current)
      })
    host.addEventListener('click', onClick, true)

    return () => {
      obs.disconnect()
      host.removeEventListener('click', onClick, true)
    }
  }, [root])
}
