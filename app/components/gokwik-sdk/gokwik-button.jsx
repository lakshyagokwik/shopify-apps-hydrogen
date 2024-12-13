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

  const addToCart = (cart) => {
    const query = `
        mutation addItemToCart($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id}}}`;
    const variables = {
      cartId: cart.id,
      lines: {
        merchandiseId: cart?.lines[0]?.merchandise?.id,
        quantity: cart?.lines[0]?.quantity,
      },
    };
    gokwikStoreFrontApi(query, variables);
  };

  const removeFromCart = (cart) => {
    const lineIDsToRemove = [];
    const query = `
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
     id
    }

  }
}`;
    const variables = {
      cartId: cart.id,
      lineIds: [],
    };
    gokwikStoreFrontApi(query, variables);
  };

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
  function getCookie(cname) {
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
    const triggerGokwikCheckout = async () => {
      const cartID =
        JSON.parse(localStorage.getItem('cartLastUpdatedAt') || '')?.id ||
        getCookie('cart');
      document.cookie.slice();
      const apiResponse = await getCart(cartID);
        cart = apiResponse.data ? apiResponse.data.cart : null;
        console.log(cart)
      buyNowRun = false;
    }
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
