import {useEffect} from 'react';
import {gokwikConfig, triggerGokwikCheckout} from './gokwik.helper';
import {getShopifyCookies} from '@shopify/hydrogen-react';
import {Meta} from '@remix-run/react';

export function GokwikButton(passedData) {
  useEffect(() => {
    window.gkShopDomain = gokwikConfig.gkShopDomain;
    window.gkShopifySessionId = getShopifyCookies('_shopify_s');
    window.gkMerchantId = gokwikConfig.merchantId;

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href =
      'https://pdp.gokwik.co/checkout-enhancer/merchant-sdk/gokwik-sso-sdk.css';
    document.head.appendChild(cssLink);

    const markupContainer = document.createElement('div');
    markupContainer.innerHTML = `
          <div id="gk-modal" class="gk-modal">
            <div class="gk-modal-content">
              <center>
                <div class="loader-content">
                  <div class="gk-loader"></div>
                </div>
              </center>
              <div class="gk-otp-popup">
                <span class="gk-close">&times;</span>
                <iframe class="gk-login" title="description" src='https://pdp.gokwik.co/checkout-enhancer/index.html'></iframe>
              </div>
              <div class="gk-modal-footer"></div>
            </div>
          </div>
        `;
    document.body.appendChild(markupContainer);
    const scriptTag = document.createElement('script');
    scriptTag.src =
      'https://pdp.gokwik.co/checkout-enhancer/merchant-sdk/gokwik-sso-sdk.js';
    scriptTag.async = true;
    document.head.appendChild(scriptTag);
  }, []);

  return (
    <>
      <Meta
        httpEquiv="Content-Security-Policy"
        content="connect-src 'self' https://pdp.gokwik.co/ https://monorail-edge.shopifysvc.com https://wsyk17-s0.myshopify.com https://prod-shp-checkout.gokwik.co http://localhost:* ws://localhost:* ws://127.0.0.1:* ws://*.tryhydrogen.dev:*"
      />
      {!passedData.hideButton && (
        <button
          onClick={(event) => {
            event.preventDefault();
            triggerGokwikCheckout();
          }}
        >
          {'Checkout Now'}
        </button>
      )}
    </>
  );
}
