# Route and the Error (Buyer )

1. http://localhost:3000/dashboard 
 - A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.


2. http://localhost:3000/dashboard/wishlist
 - This page could not be found.

3. http://localhost:3000/shop
 - Each child in a list should have a unique "key" prop.
   Check the render method of `ShopPage`. See https://react.dev/link/warning-keys for more information.

4. http://localhost:3000/dashboard/orders 
  - This page could not be found.

5. http://localhost:3000/dashboard/settings
  - This page could not be found.


# Route and the Error (Seller )

1. Register as a Seller 
- A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages

2. http://localhost:3000/dashboard/books
 - This page could not be found.

3. http://localhost:3000/dashboard/settings
 - This page could not be found.

4.  http://localhost:3000/dashboard
 - A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error