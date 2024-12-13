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
  storefrontAccessToken: '1e4b402554a38216e446f1607a61c3dc',
  shopifyGraphQlUrl: 'https://wsyk17-s0.myshopify.com/api/2022-07/graphql.json',
  gkShopDomain: 'wsyk17-s0.myshopify.com',
};
//https://sa-hydrogen-storefront-61e6fa1690867543bfae.o2.myshopify.dev/products/diljit-dosanjh-dil-uminati-tour-merch-1?Size=XS

// window.gkCustomerEmail = "{{ customer.email }}";
// window.gkLogOutUrl = "{{ routes.account_logout_url }}";
