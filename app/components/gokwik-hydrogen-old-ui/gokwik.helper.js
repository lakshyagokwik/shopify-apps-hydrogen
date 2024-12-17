/*
PLEASE DON'T CHANGE ANY VALUES WITHOUT CONFIRMATION AS THAT WILL DIRECTLY IMAPCT THE FUNCTIONING OF THE GOKWIK CHECKOUT

Keys required:
merchantId: store identifier for Gokwik checkout
gkShopDomain: store url, used by Gokwik for identification
shopifyGraphQlUrl: Graph QL API for your store, follows the format-
          https://{store_name}.myshopify.com/api/{api-version}/graphql.json

*/

export const gokwikConfig = {
  merchantId: '19g6im416netb',
  shopifyGraphQlUrl: 'https://virgiodev.myshopify.com/api/2022-07/graphql.json',
  gkShopDomain: 'virgiodev.myshopify.com',
};

export const triggerGokwikCheckout = async () => {
  const LOGIN_IFRAME_HOST =
    'https://pdp.gokwik.co/checkout-enhancer/index.html';
  const API_URL = 'https://prod-shp-checkout.gokwik.co';
  const cartToken = localStorage.getItem('cartLastUpdatedAt')
    ? JSON.parse(localStorage.getItem('cartLastUpdatedAt'))?.id?.split(
      'Cart/',
    )[1]
    : getGkCookie('cart');

  const discountCode = getHydrogenDiscountCode();
  const body = {
    merchantDomain: gokwikConfig.gkShopDomain,
    mid: gokwikConfig.merchantId,
    cartToken,
    shopifySessionId: window.gkShopifySessionId,
  };
  const KWIK_SIGNED_IN = 'KWIKSIGNEDIN';
  localStorage.setItem(KWIK_SIGNED_IN, '');
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
    { type: 'popup-display-change', gkModalDisplay: 'block' },
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

  try {
    analyticsEvent({
      adSource,
      eventType: 'onGkClick',
      merchantId: window.gkMerchantId,
      name: 'gokwik-button-clicked',
      type: 'event',
      shopifySessionId: window.gkShopifySessionId,
    });
  } catch (err) {
    console.log(err);
  }
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
