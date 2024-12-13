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
  env: 'production',
  storefrontAccessToken: 'b4f7b1ecd2f99132f09e5fffb191b395',
  shopifyGraphQlUrl:
    'https://test-account-for-plus-stores.myshopify.com/api/2022-07/graphql.json',
};
