/*
PLEASE DON'T CHANGE ANY VALUES WITHOUT CONFIRMATION AS THAT WILL DIRECTLY IMAPCT THE FUNCTIONING OF THE GOKWIK CHECKOUT

Keys required:
mid: store identifier for Gokwik checkout
env: API environment for Gokwik checkout
storefrontAccessToken: Storefront API access token for Gokwik app installed on your store
shopifyGraphQlUrl: Graph QL API for your store, follows the format-
					https://{store_name}.myshopify.com/api/{api-version}/graphql.json

*/

export const gokwikConfig = {
  mid: '19g6ilb0pbcu7',
  storefrontAccessToken: '7bd989f4ef8935305413a01a0bbabf5b',
  shopifyGraphQlUrl:
    'https://qa-store-kwik-labs.myshopify.com/api/2022-07/graphql.json',
  gkShopDomain: 'qa-store-kwik-labs.myshopify.com',
};

// window.gkCustomerEmail = "{{ customer.email }}";
// window.gkLogOutUrl = "{{ routes.account_logout_url }}";
