const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUTkWl9ueWEJ-J7zJhDNv3YL6NL5PogQs5VSiHPn_I6Pi9uTxANaEuFniwAMXiEn9DeMk2xnPgp3DzPq',
  'client_secret': 'EJQnpprjitxz9Q_bNJUtgPbgjZx0cJvnoxM1Tk_q0b7sA2rsJYryZl-4-B5mu7vWEVrEshh6TseXH2EG'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:4000/success",
      "cancel_url": "http://localhost:4000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Corinthians",
          "sku": "001",
          "price": "25.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "25.00"
      },
      "description": "The best football team EVER!"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});


app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.render('success');
    }
  });
});

app.get('/cancel', (req, res) => res.render('cancelled'));


app.use(express.static(__dirname + '/styles'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/scripts'));

app.listen(4000, () => console.log('Server Started'));