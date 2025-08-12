### Feature 01: Shop Page Implementation

1.1. Introduce a Color entity and configure the data model in a way that products can be linked with a color if needed via a “colorId” field on the Product schema. 

1.2. Currently we just have a placeholder shop view on the home page. Now you need to implement the shop page with the following features. All sorting and filtering should happen on the `server side` .

- The same shop page should be shown at the following URLs,
    - /shop ⇒ Show all products
    - /shop/shorts, /shop/t-shirts and so on for each category ⇒ Will have a filtered view of all products in that specific category
- Implement following features on the server side on all the above pages
    - Filter products by category
    - Filter products by color
    - Sort products by price
        - Ascending
        - Descending
    - Ability to have  both sorting and filtering enabled at the same time
    - This should be implemented via server side filtering

### Feature 02: Product Page Implementation

2.1 Currently we don’t have a specific product page. But implement a product page in a route like “/shop/products/:productId” and show the details about the project there. An add to cart button should also be present in that route.

2.2 Introduce a description field to the Product schema and show it on the product page as well.

### Feature 03:  Order views Implementation

3.1 For signed in users implement a page like “My Orders”  where users can view the orders they have placed in the past along with the data associated to it 

3.2 For **`Admin`** users implement a separate page where they can view the orders that users have placed 

### Feature 04: Sales Dashboard implementation

For `Admin` users implement a sales dashboard page where they can view ,

The total sales by each day for the Last 7 days, Last 30 days using shadcn charts

- Research how chart components work and implement a chart showing total for each day for last 7 days using a suitable chart
- Reference:https://ui.shadcn.com/charts/line#charts    