let tmg = TMG ();
var stripe = Stripe('pk_test_jG2nWi3Lmp4ckgxlvkZGAbRt0090JOjPZT');
var elements = stripe.elements({
  fonts: [
    {
      family: 'Open Sans',
      weight: 400,
      src: 'local("Open Sans"), local("OpenSans"), url(https://fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3ZBw1xU1rKptJj_0jans920.woff2) format("woff2")',
      unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215',
    },
  ]
});

var card = elements.create('card', {
  hidePostalCode: true,
  style: {
    base: {
      iconColor: '#F99A52',
      color: '#32315E',
      lineHeight: '48px',
      fontWeight: 400,
      fontFamily: '"Open Sans", "Helvetica Neue", "Helvetica", sans-serif',
      fontSize: '15px',

      '::placeholder': {
        color: '#CFD7DF',
      }
    },
  }
});
card.mount('#card-element');

async function setOutcome(result) {
  try {
    if (result.token) {
      await tmg.createToken (result.token);
      successElement.querySelector('.token').textContent = result.token.id;
      successElement.classList.add('visible');
    } else if (result.error) {
      errorElement.textContent = result.error.message;
      errorElement.classList.add('visible');
    }
  } catch (err) {
    alert (err);
  }
}

card.on('change', function(event) {
  setOutcome(event);
});

const _el = (str='div', parent, txt) => {
  let arr = str.split ('.');
  let ret = document.createElement (arr.splice (0, 1) [0]);
  arr.forEach (cn => ret.classList.add (cn));
  if (txt) ret.innerText = txt;
  if (parent) parent.appendChild (ret);
  return ret;
}

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  var form = document.querySelector('form');
  var extraDetails = {
    name: form.querySelector('input[name=cardholder-name]').value,
    address_zip: form.querySelector('input[name=address-zip]').value
  };
  stripe.createToken(card, extraDetails).then(setOutcome);
});

// ui for user to show form
const userAddCard = (me) => {
  document.querySelector ('#cardholder-name').value = me.first + ' ' + me.last;
  document.querySelector ('#email').value = me.email;
  form.classList.remove ('collapsed');
}

// ui component to show if user is subscribed
const userIsSuscribed = (me) => {
  let div = _el ('div.text-center', cardParent, `Welcome congressperson ${me.first} ${me.last}!
  Your dues are paid until ${me.paidThrough.month}/${me.paidThrough.year}, at which point you will be billed $12 again -
  let's make a difference together!`);
  cardParent.classList.remove ('collapsed');
}

let cardParent = document.querySelector ('#in-use');
let form = document.querySelector ('#form');
(async () => {
  let me = false;
  let cardsInUse = false;
  try {
    me = await tmg.me ();
    cardsInUse = await tmg.getPaymentMethods ();
  } catch (e) {
  }
  if (!me) return location.href = '/login.html';
  if (!me.subscribed || !cardsInUse || !cardsInUse.length) {
    userAddCard (me);
  } else if (me.subscribed) {
    userIsSuscribed (me);
  } else {
    let card = cardsInUse [0];
    _el ('div', cardParent, `Currently using ${card.brand} ending in ${card.last4}`);
    _el ('button', cardParent, 'Add new card...').addEventListener ('click', () => {
      cardParent.classList.add ('collapsed');
      form.classList.remove ('collapsed');
    });
    cardParent.classList.remove ('collapsed');
  }
}) ();