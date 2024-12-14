import {useEffect} from 'react';
import {gokwikConfig} from './gokwik.config';
import {getShopifyCookies} from '@shopify/hydrogen-react';

export function GokwikButton(passedData) {
  let buyNowRun = false;

  useEffect(() => {
    window.gkShopDomain = gokwikConfig.merchantId;
    // window.gkCustomerEmail = "{{ customer.email }}";
    // window.gkLogOutUrl = "{{ routes.account_logout_url }}";
    window.gkShopifySessionId = getShopifyCookies('_shopify_s');
    window.gkMerchantId = gokwikConfig.merchantId;
    // Insert CSS in <head>
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href =
      'https://pdp.gokwik.co/checkout-enhancer/merchant-sdk/gokwik-sso-sdk.css';
    document.head.appendChild(cssLink);

    // Insert JS in <head>
    const scriptTag = document.createElement('script');
    scriptTag.src =
      'https://pdp.gokwik.co/checkout-enhancer/merchant-sdk/gokwik-sso-sdk.js';
    scriptTag.async = true;
    document.head.appendChild(scriptTag);

    // Insert HTML markup in <body>
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
                <iframe class="gk-login" title="description"></iframe>
              </div>
              <div class="gk-modal-footer"></div>
            </div>
          </div>
        `;
    document.body.appendChild(markupContainer);
  }, []);
  const triggerBuyNow = (passedData) => {
    createBuyNowCart(passedData);
  };

  const variables = {
    cartId: cart.id,
    lineIds: [],
  };
  gokwikStoreFrontApi(query, variables);

  const createBuyNowCart = (passedData) => {
    const query = `
	mutation createCart($cartInput: CartInput) {
  cartCreate(input: $cartInput) {
    cart {
      id
      discountAllocations {
        ... on CartAutomaticDiscountAllocation {
          title
          discountedAmount {
            currencyCode
            amount
          }
        }
      }

      discountCodes {
        applicable
        code
      }

      attributes {
        key
        value
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }
      totalQuantity
      note
      lines(first: 100) {
        edges {
          node {
            id
						discountAllocations{
							 ... on CartAutomaticDiscountAllocation {
								title
								discountedAmount {
									currencyCode
									amount
								}
							}
						}
            merchandise {
              ... on ProductVariant {
                id
                title
								weight
								weightUnit
                product {
                  createdAt
                  description
                  id
                  productType
                  title
                  updatedAt
                  vendor
                }
                image {
                  height
                  id
                  url
                  width
                }
                price
                unitPrice {
                  amount
                  currencyCode
                }
              }
            }
            quantity
          }
        }
      }
    }
  }
}
`;
    const variables = {
      cartInput: {
        lines: [
          {
            quantity: passedData.quantity,
            merchandiseId: passedData.variantId,
          },
        ],
      },
    };
    gokwikStoreFrontApi(query, variables, passedData).then((res) => {
      triggerGokwikCheckout(res.data.cartCreate.cart);
    });
  };

  const getCart = async (id) => {
    const query = `
		query getCart($cartId: ID!){
    cart(id: $cartId){
      id
      discountAllocations {
        ... on CartAutomaticDiscountAllocation {
          title
          discountedAmount {
            currencyCode
            amount
          }
        }
      }

      discountCodes {
        applicable
        code
      }

      attributes {
        key
        value
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
      totalQuantity
      note
      lines(first: 100) {
        edges {
          node {
            id
						discountAllocations {
							... on CartAutomaticDiscountAllocation {
								title
								discountedAmount {
									currencyCode
									amount
								}
							}
						}
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  createdAt
                  description
                  id
                  productType
                  title
                  updatedAt
                  vendor
                }
                image {
                  height
                  id
                  url
                  width
                }
                price
                unitPrice {
                  amount
                  currencyCode
                }
              }
            }
            quantity
          }
        }
      }
    }
  }`;
    const variable = {cartId: id};
    return await gokwikStoreFrontApi(query, variable);
  };

  const gokwikStoreFrontApi = async (query, variables) => {
    return await fetch(gokwikConfig.shopifyGraphQlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': gokwikConfig.storefrontAccessToken,
      },
      body: JSON.stringify({query, variables}),
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  function getGkCookie(cname) {
    let name = cname + '=';
    let decodedCookie = document.cookie;
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
  function getHydrogenDiscountCode() {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
      let [key, value] = el.split('=');
      cookie[key.trim()] = value;
    });
    const discountCode =
      cookie['discount_code'] ||
      cookie['coupon_applied'] ||
      cookie['applied-coupons'];
    return discountCode;
  }

  const triggerGokwikCheckout = async () => {
    const LOGIN_IFRAME_HOST =
      'https://pdp.gokwik.co/checkout-enhancer/index.html';
    const API_URL = 'https://prod-shp-checkout.gokwik.co';
    const cartId =
      JSON.parse(localStorage.getItem('cartLastUpdatedAt') || '')?.id ||
      getGkCookie('cart');

    const discountCode = getHydrogenDiscountCode();
    const body = {
      merchantDomain: window.location.origin,
      mid: window.gkMerchantId,
      cartId,
    };
    const KWIK_SIGNED_IN = 'KWIKSIGNEDIN';

    localStorage.setItem(KWIK_SIGNED_IN, undefined);
    const response = await fetch(API_URL + '/v3/login/request', {
      method: 'POST',
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const res = await response.json();
    const requestId = res.data.requestId;
    if (response.status !== 200 || !requestId) {
      window.location.href = '/checkout';
    }
    if (res?.data?.failsafe) {
      let gkFailSafe = res?.data?.failsafe;
      if (gkFailSafe) {
        window.location.href = window.location.origin + '/checkout';
        return;
      }
    }
    let url = API_URL + '/sa-login-ui/gk_sa_login.html?reqId=' + requestId;
    const kp_email = localStorage.getItem('kp_email');
    if (kp_email) {
      url = url + '&kpe=' + kp_email;
    }

    if (discountCode) {
      url = url + '&cd=' + discountCode;
    }
    let gkIframe = document.getElementsByClassName('gk-login')[0];

    gkIframe.contentWindow.postMessage(
      {
        type: 'utm_params',
        orig_referrer: document.referrer,
        mkt_source: sessionStorage.getItem('gkMktSource'),
        mkt_campaign: sessionStorage.getItem('gkMktCampaign'),
        mkt_medium: sessionStorage.getItem('gkMktMedium'),
        mkt_content: sessionStorage.getItem('gkMktContent'),
        mkt_term: sessionStorage.getItem('gkMktTerm'),
        source: sessionStorage.getItem('gkSource'),
        landing_page: sessionStorage.getItem('gkLandingPage'),
      },
      LOGIN_IFRAME_HOST,
    );

    gkIframe.contentWindow.postMessage(
      {
        type: 'merchant_url',
        url: window.location.href,
      },
      LOGIN_IFRAME_HOST,
    );
    const gkModal = document.getElementById('gk-modal');

    gkModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementsByClassName('loader-content')[0].style.display = 'none';
    document.getElementsByClassName('gk-otp-popup')[0].style.display = 'block';
    gkIframe.contentWindow.postMessage(
      {type: 'popup-display-change', gkModalDisplay: 'block'},
      LOGIN_IFRAME_HOST,
    );
    const KWIK_SESSION_TOKEN_KEY = 'KWIKSESSIONTOKEN';

    const token = getGkCookie(KWIK_SESSION_TOKEN_KEY);
    const adSource =
      window.location.href.split('?').length > 1
        ? window.location.href.split('?')[1]
        : undefined;

    gkIframe.contentWindow.postMessage(
      {
        domain: window.gkShopDomain,
        email: window.gkCustomerEmail,
        cart: 'hydrogen',
        token,
        shopifySessionId: window.gkShopifySessionId,
        discountCode: getHydrogenDiscountCode(),
        kwikPassEmail: kp_email,
        source: adSource,
        requestId,
      },
      LOGIN_IFRAME_HOST,
    );

    analyticsEvent({
      adSource,
      eventType: 'onGkClick',
      merchantId: window.gkMerchantId,
      name: 'gokwik-button-clicked',
      type: 'event',
      shopifySessionId: window.gkShopifySessionId,
    });

    buyNowRun = false;
  };

  return (
    <>
      {!passedData.hideButton && (
        <button
          onClick={(event) => {
            event.preventDefault();
            passedData.buyNowButton
              ? triggerBuyNow(passedData)
              : triggerGokwikCheckout();
          }}
        >
          {passedData.buyNowButton ? 'Gokwik Buy Now' : 'Pay via UPI/COD'}
        </button>
      )}
    </>
  );
}
