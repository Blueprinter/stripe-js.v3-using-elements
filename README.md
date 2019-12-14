# stripe-js.v3-using-elements
Stripe payment system using JS version 3 - This is an "In-App" payment system using Stripe Elements

To see the original stripe example code, use the link: https://github.com/stripe/stripe-payments-demo

Most of the code in this example is code provided at the link above.  I have added some code to integrate the stripe code into an Apps Script Web App.  This code uses "google.script.run.appsScriptFunctionName()" to run a server function from the browser (client side).  This example code is set up in an Apps Script Web App, but can easily be used in a dialog box in a Google Sheet, Google Form or Google Doc.

Stripe has a client side JavaScript library, which is in version 3 at the time of this commit, and a server side API which is still technically in version 1.  But the server side API of version 1 is misleading, because there are new versions that go by date.  So, even though the API is technically version 1, there are new versions by date that you should update to if possible.

You must use both the client side library and server side code, unless you design your own customer input form that takes the customer credit card number.  But creating your own credit card payment form is not recommended.

The goal is to accept a payment from Stripe from a Google add-on, or Google Web App without the user needing to navigate to another tab in the browser or another browser window, for example, to your website.  In other words, the goal is to provide the user with an “in-app” purchase.

For this payment process, the user does NOT need to get a registration code from you, navigate back to your app, and enter it in order to prove that they paid.

In order to provide a broad understanding of what Stripe offers for solutions, I will explain some options that you DON'T want, if you want an "In-App" payment solution.

It's important to understand a subtle difference between prebuilt Stripe forms, and prebuilt Stripe Elements.  Both use the word "prebuilt."  Both the prebuilt Stripe forms and the prebuilt Stripe elements are capable of customizing a payment form.  So, if you are trying to figure out what the difference is, it can be a little hard to determine that.  Basically, the difference is the flow of events.  With the prebuilt form you must redirect the person paying to your website to accept a payment.

Stripe has “prebuilt” checkout forms ("Checkout").  Don't use this if you want an "In-App" payment solution.  To use a prebuilt solution, you must redirect users to your hosted payment page.  And after the customer has paid, they must be redirected back to the original place.  And then you’d need to create a “webhook” to fulfill the order (Eg. Save the customers new expiration date into a database, and somehow make sure that every time the add-on code runs, that it “knows” that the customer has paid) 

In the prebuilt checkout process flow, the steps are:
Create a checkout session on your server
Redirect the user to the Checkout payment form somewhere else
The customer pays
Redirect the user to another place
Fulfill the customers order - set up a webhook (Apps Script Web App) to receive confirmation from Stripe that the payment was completed

Even after all the above steps have completed, you still need the add-on code to somehow access your stored customer data to verify whether the user has paid or not.

Even though I will not be using the stripe “Checkout” (prebuilt form) I am giving information about it in case you want to read the stripe documentation yourself, hopefully my explanation will give you a broad overview.  I’m trying to explain what the important differences are between the Checkout and Payment systems, so that you can be confident that you are choosing the best solution for your situation.

Using the prebuilt “Checkout” form, the third step is to redirect the user somewhere (Your website - a confirmation of payment page) after they have paid.  From there you could provide a message to the user to manually go back to their document.  But I don’t think that you can automatically navigate the user back to their document, and then have the add-on code trigger to provide feedback of confirmation.  The “Payment” system is different.  With the Payment system, the user doesn’t need to be redirected to your website, and then to a payment confirmation page, and then instructed to go back to their document.

To have a “built-in” payment form in your app, you can’t use the “Checkout” prebuilt form solution, but must use Stripe Elements to create your own checkout form.

The stripe “Checkout” (prebuilt form) examples, have a setting for a success URL to direct the user to a link at your website, indicating that the charge to their credit card was successful.  But, the goal is to confirm to the user that their payment was successful from within the add-on.  This information is for providing an “in-app” message to the user that the charge was successful.  The “Checkout” (prebuilt) examples are meant for a quick way to get started with stripe.  But an in-app purchase in a Google add-on requires using Stripe Elements.

The documentation that you need to look at is for “Payments”  and you’ll need to look at the Web implementation.  You won’t be using a library, because there is no library for Apps Script in the stripe documentation.

The “Payments” documentation also uses the word “prebuilt” but it’s not for a payment form, but for UI components.  In other words, you can pick and choose between individual payment form fields.  So, the stripe “Checkout” documentation is for an entire prebuilt form, and the stripe “Payment” documentation uses prebuilt UI Components. (individual form fields)

Both the Checkout system and the Payment system make a request from the  sellers server (Google’s server from your google account) to stripes server.  In the case of a Google add-on, from Apps Script, which is from Google’s server to Stripes server.  So, in both the prebuilt Checkout system and the custom Payment system there is a server to server request.  In the Checkout system, the server to server request is the very first step.  In the Payment system, the server to server request is the last step which does the actual charge.

In the Checkout system, the CHECKOUT_SESSION_ID must be passed in order for stripe to match up the customer from your app to the same customer in the checkout page on your website.

With the Payment system, the Token ID is used to match up the customer information submitted from your app (Add-on) to the eventual charge made from the server.  The actual payment doesn’t happen when the customer submits the payment form, it happens when you call stripes server with the Token ID from Apps Script.

The Token ID is generated by the client side stripe library when the customer submits the payment form in your add-on.  This is known as “client-side tokenization.”  After stripes client side code tokenizes the customer information, the customer information is stored on stripes server, and associated with a Token ID, and the Token ID is provided to your app.  Then your add-on code must get the Token ID from the client side code and send the ID to the server.  , The Token ID is then used to make the charge to Stripe.  So, your add-on code never “sees” the credit card number or other credit card information.  The client side stripe code securely tokenizes the credit card information.  And the way that stripe matches up the customers credit card information with your stripe account is with the Token ID.  Quote from stripe documentation: 

“This ensures that no sensitive card data touches your server, and allows your integration to operate in a PCI-compliant way.”

So, you can’t get the credit card number, expiration date, and CVC code from the payment form.

Tokens can only be used once.

 How do you make the server to server request from your Apps Script code to Stripe’s server?
You will need to use UrlFetchApp.fetch(url, options) to make the REST API requests to stripe.  

The curl examples in the documentation are the closest representation for that, since you won’t be using an SDK because there isn’t one available for Apps Script. 

The stripe payment form (for a web app) must use a <form> tag, and the form tag has an action attribute.  But the stripe client side code prevents the default action, meaning that the form doesn’t get submitted.  So if you notice the form tag, and know anything about what an HTML form does, don’t be confused about what actually happens. A POST request doesn’t get made when the user clicks the submit button even though the form has an action attribute.  If you don’t set up the client side code correctly, then the form might get submitted, which will result in an error.

In the example code for the index JS, an event listener is added to the submit button, and the code has a:

e.preventDefault();

line which prevents the form from being submitted.  You might wonder why the html would be set up to have an action attribute to submit the form, and then prevent the form from being submitted.  It’s done that way in order to use the built-in html validation of form fields.

You will be using the “google.script.run.my_Server_Function” call to send the payment information to the server.

NOTE: In the U.S., unless you use a “Payment Intent” then your Stripe code will only accept payments from the U.S. and Canada.  To accept payments globally, you must use a Payment Intent.
To accept payments globally, see the following link:
https://stripe.com/docs/payments/accept-a-payment

The Payment process described above does not use a webhook.  And you won’t need a web hook because the actual payment received happens when your Apps Script code calls stripe, and you will know whether the payment was successful because stripe sends back a code.

You’d only need to use a web hook if you were using the Checkout system, sending your user to your website to pay, which can’t get a message back to your add-on code about whether the payment was successful or not.  You could accept payments that way, but you’d need to have the web hook save the customer payment date to your database, and then the add-on would need to look up that customer in your database when the add-on code runs.

You’d probably want to have a customer database anyway, even with the in-app Payment system.  But with the in-app Payment system, the customer can get almost immediate access to the paid services.

The steps needed for the entire process are outlined in the documentation at:

https://stripe.com/docs/payments/accept-a-payment-charges

The vast majority of the code that you need is provided in examples on GitHub.  But those examples only get you as far as the custom input form, the user submission, and getting the token ID back.  The code for sending the token from the client to the server, and then using the stripe API to get the actual payment from stripe from the Apps Script request is not provided in the GitHub code.  Obviously, that part is specific to Apps Script, and not generic.  But in my example, I will provide the Apps Script code for the last part of the process.

Obviously, you won’t want to use all 5 stripe payment forms in your app, so you’ll only want to load one CSS file and one HTML file for the payment form.  In the example, the Web App loads 5 different CSS files, 5 JavaScript files, and the H_Stripe file has 5 payment forms in it.  So, you need to edit the H_Stripe file and delete what you don’t need.  You’ll need to load only one CSS file and one JS file into the H_Stripe  file.  

In the H_Stripe file, there is a scriptlet that loads the CSS:

<?!= loadCSS_(['CSS_Stripe_Base','CSS_Stripe_Example1','CSS_Stripe_Example2','CSS_Stripe_Example3','CSS_Stripe_Example4',
  'CSS_Stripe_Example5']) ?>

You need to remove 4 of the 'CSS_Stripe_ExampleX' strings.  Which ones you remove depends on which example you use for your payment form.  Or you may rename the files, and edit them.

The point is, that even though this is a fairly complete example, there could still be a lot of work to do to in order to customize the HTML and CSS to your needs.
