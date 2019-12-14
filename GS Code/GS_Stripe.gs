function paymentSettings_() {  
  return {
    nmbrOfDaysPaidFor:365,
    expectedPaymentAmt:2000,
    createCustomer:false,
    description:"My Add-on - One year subscription"
  }
}

function getStripeSecret_() {
  //You must get the server side stripe secret from your stripe account
  return 'Put the server side stripe secret here';
}

function runSrvrCode(x) {
  var dataObj,key;
  //console.log('x 17: ' + x)
  
  key = x[0];//Get key code sent from the client side
  dataObj = x[1];
  //console.log('key 19: ' + key)
  //console.log('dataObj 19: ' + JSON.stringify(dataObj))
  //console.log('dataObj.tokenId 19: ' + dataObj.tokenId)
  
  if (key === 'cpoisdnf') {
    if (!dataObj.tokenId) {return false;}//A token ID was not passed from the client side - something is wrong
    //The client side stripe code must generate a token ID to finish processing
    return vmopaw8475tygosadf_(dataObj);//Call 
  }
}

function vmopaw8475tygosadf_(po) {
try{
  var amount,buildQryStr,charge,chargeResponse,createTheCustomer,customer,custId,description,jsonP,nmbrOfDaysPaidFor,
      paidToDate,params,paySets,postRequestToStripe,settings,token;
  /*
    This code makes a payment to stripe
  
    You must use a stripe secret which can be for either live or testing 
    po.tokenId - 
  */
  
  buildQryStr = function(parameters) {//sub fnk
  try{
    var k,value,qStr;
    qStr = [];
    
    for (k in parameters) {
      value = parameters[k];
      
      if (parameters.hasOwnProperty(k) && value) {
        
        if (value.map) {
          qStr.push(value.map(function(array_value) {
            return k + "=" + encodeURIComponent(array_value);
          }).join("&"));
        } else {
          qStr.push(k + "=" + encodeURIComponent(value));
        }
      }
    }
    
    qStr = qStr ? qStr.join("&") : "";
    
    //Logger.log('qStr 45',qStr);
    return qStr
  }catch(e) {
    console.log("Err: " + e + "\nStack: " + e.stack)
  }
  }
  
  postRequestToStripe = function(argO) {
  try{
    var mapKeyToUrl,options,qryStr,secret,url;
    /**
    * Generic function for making different types of POST requests to the Stripe API

    argO.requestType - type of API request
    argO.prmtrs - query string parameters
    argO.fields - 
    argO.expandableFlds - fields to expand
    */
    
    mapKeyToUrl = {
      chrg:'charges',
      cust:'customers'
    }
    
    if (argO.expandableFlds) {
      argO.prmtrs["expand[]"] = [];
      
      argO.fields.forEach(function(field) {
        //Logger.log('argO.fields 65',argO.fields)
        
        field = field.split(".")[0];
        if (argO.expandableFlds.indexOf(field) !== -1) {
          argO.prmtrs["expand[]"].push("data." + field);
        }
      });
    }
    
    secret = getStripeSecret_();//Get server side stripe secret
    
    options = {
      "method" : "post",
      "headers": {
        "Authorization": "Bearer " + secret,
        "User-Agent": "Company Name/1.0"
        //"Stripe-Version":"2019-11-05" - This is used to test a specific API version before changing to it in the stripe dashboard
      }
    };
    
    qryStr = buildQryStr(argO.prmtrs);
    qryStr = qryStr ? "?" + qryStr : "";
    //Logger.log('mapKeyToUrl[argO.requestType] 115: ' + mapKeyToUrl[argO.requestType]);
    
    url = "https://api.stripe.com/v1/" + mapKeyToUrl[argO.requestType] + qryStr;
    
    //Logger.log('url 119: ' + url);
    
    return Url_Fetch_App.fe_tch(url, options);//REMOVE THE UNDERBARS
  }catch(e) {
    console.log("Error: " + e + "Stack: " + e.stack)
    errorHandler_(e);
    return false;
  }
  }
  
  createTheCustomer = function() {// Create a Customer (optional)
    var customer,id,params,settings;
    
    params =  {
      "description": "Company Name customer", 
      "source": po.token.id,
      "email": po.email
    }
    
    settings = {
      requestType:'cust',
      prmtrs:params
    }

    customer = postRequestToStripe(settings);//Make a POST request to Stripe with this path and parameters
    //Logger.log('customer 128',JSON.stringify(customer))
    
    if (customer === 'err') {
      return ['error',0];
    }
    
    id = JSON.parse(customer.getContentText()).id;
    //Logger.log('id 135',id)
    return id;
  }
  
  //Logger.log("po 155: " + JSON.stringify(po))
  
  if (!po.tokenId) {//The token ID was not passed in which is required - without it nothing can be done
    errorHandler_({message:'There is no token ID'});
    return false;
  }
  
  token = po.tokenId;//Use token to call the stripe server and charge the users credit card
  paySets = paymentSettings_();
  
  if (paySets.createCustomer) {//If true - a customer should be created
    custId = createTheCustomer();
  }

  nmbrOfDaysPaidFor = paySets.nmbrOfDaysPaidFor;
  amount = paySets.expectedPaymentAmt;
  description = paySets.description;
  
  params = {
    "currency": "usd", 
    "amount": Number(amount),
    "description": description,
    "receipt_email": po.email, //customer email
    "source":token
  }
  
  if (custId) {
    params.customer = custId
  }
  
  settings = {
    requestType:'chrg',
    prmtrs:params
  }

  //console.log('params: ' + JSON.stringify(params))

  charge = postRequestToStripe(settings);// Create a Charge
  //Logger.log('charge 193: ' + charge)
  
  /*
  This is an example of the charge return object
  {
  "id": "id_Number",
  "object": "charge",
  "amount": 2000,
  "amount_refunded": 0,
  "application": null,
  "application_fee": null,
  "application_fee_amount": null,
  "balance_transaction": "txn_13456",
  "billing_details": {
    "address": {
      "city": null,
      "country": null,
      "line1": null,
      "line2": null,
      "postal_code": "09999",
      "state": null
    },
    "email": null,
    "name": "First Last",
    "phone": null
  },
  "captured": true,
  "created": 1575569961,
  "currency": "usd",
  "customer": null,
  "description": "My Add-on - One year subscription",
  "destination": null,
  "dispute": null,
  "disputed": false,
  "failure_code": null,
  "failure_message": null,
  "fraud_details": {
  },
  "invoice": null,
  "livemode": false,
  "metadata": {
  },
  "on_behalf_of": null,
  "order": null,
  "outcome": {
    "network_status": "approved_by_network",
    "reason": null,
    "risk_level": "normal",
    "risk_score": 50,
    "seller_message": "Payment complete.",
    "type": "authorized"
  },
  "paid": true,
  "payment_intent": null,
  "payment_method": "card_123456798",
  "payment_method_details": {
    "card": {
      "brand": "visa",
      "checks": {
        "address_line1_check": null,
        "address_postal_code_check": "pass",
        "cvc_check": "pass"
      },
      "country": "US",
      "exp_month": 11,
      "exp_year": 2020,
      "fingerprint": "1234679",
      "funding": "credit",
      "installments": null,
      "last4": "4242",
      "network": "visa",
      "three_d_secure": null,
      "wallet": null
    },
    "type": "card"
  },
  "receipt_email": "example@gmail.com",
  "receipt_number": null,
  "receipt_url": "https://pay.stripe.com/receipts/",
  "refunded": false,
  "refunds": {
    "object": "list",
    "data": [

    ],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/charges/134679/refunds"
  },
  "review": null,
  "shipping": null,
  "source": {
    "id": "card_1346579
    "object": "card",
    "address_city": null,
    "address_country": null,
    "address_line1": null,
    "address_line1_check": null,
    "address_line2": null,
    "address_state": null,
    "address_zip": "09999
    "address_zip_check": "pass",
    "brand": "Visa",
    "country": "US",
    "customer": null,
    "cvc_check": "pass",
    "dynamic_last4": null,
    "exp_month": 11,
    "exp_year": 2020,
    "fingerprint": "1324679
    "funding": "credit",
    "last4": "4242",
    "metadata": {
    },
    "name": "First Last",
    "tokenization_method": null
  },
  "source_transfer": null,
  "statement_descriptor": null,
  "statement_descriptor_suffix": null,
  "status": "succeeded",
  "transfer_data": null,
  "transfer_group": null
}
*/
  
  chargeResponse = charge.getResponseCode();
  //Logger.log('chargeResponse 319: ' + chargeResponse)

  if (Number(chargeResponse) === 200) {
    //Logger.log('chargeResponse is 200')
    
    paidToDate = update_Customer_Database({'account':charge.receipt_email,"payer_email": charge.receipt_email,"address_zip": charge.source.address_zip,"nmbrOfDaysPaidFor":nmbrOfDaysPaidFor,"status":charge.status});
  }
  
  //Logger.log('paidToDate 327: ' + paidToDate)
  
  return [chargeResponse,amount,paidToDate];//the chargeResponse is an HTTP Response code

}catch(e) {
  //Logger.log('Error: ' + e.message + "\nStack: " + e.stack)
  errorHandler_(e);
  if (Number(chargeResponse) === 200) {
    return true;
  } else {
    return false;
  }
}
}
