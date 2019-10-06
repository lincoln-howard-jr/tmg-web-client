// create error classes
class EmptyFieldError extends Error {
  constructor (fields) {
    super (`${fields.join (', ')} fields are required but not specified`);
    this.fields = fields;
  }
}
class RequestStatusError extends Error {
  constructor (method, path, status) {
    super (`${method} ${path} returned with a status of ${status}`);
    this.method = method;
    this.path = path;
    this.status = status;
  }
}
class DateRange {
  constructor (d1=new Date (), d2=new Date (), d1Name="open", d2Name="close") {
    if (d1 instanceof Date && d2 instanceof Date) {
      this.d1 = new MonthDayYear (d1);
      this.d2 = new MonthDayYear (d2);
    } else {
      this.d1 = d1;
      this.d2 = d2;
    }
    this.d1Name = d1Name;
    this.d2Name = d2Name;
  }
  contains (date) {
    return this.d1.compare (date) !== this.d2.compare (date)
  }
  toJSON () {
    return {
      [this.d1Name]: this.d1.toJSON (),
      [this.d2Name]: this.d2.toJSON ()
    }
  }
  [Symbol.iterator] () {
    let eq = this.d2.compare (this.d1);
    if (eq === 0) return {
      next: () => {
        let count = 0;
        if (!count) return {done: false, value : this.d1.toJSON ()};
        return {done: true};
      }
    }
    let curr = eq === 1 ? this.d1 : this.d2;
    let last = eq === 1 ? this.d2 : this.d1;
    return {
      next: () => {
        if (curr.compare (last) === 0) return {done: true};
        let value = curr.toJSON ();
        curr = curr.next ();
        return {done: false, value};
      }
    }
  }
}
class MonthYear {
  constructor (date=new Date ()) {
    if (date instanceof Date) {
      this.month = date.getMonth ();
      this.year = date.getFullYear ();
    } else if (date instanceof MonthDayYear) {
      this.month = date.month;
      this.year = date.year;
    } else {
      this.month = date.month;
      this.year = date.year;
    }
  }
  next () {
    return new MonthYear (new Date (this.year, this.month + 1));
  }
  compare (_my) {
    let my = new MonthYear (_my);
    if (this.year === my.year) {
      if (this.month === my.month) return 0;
      return this.month > my.month ? 1 : -1;
    } else return this.year > my.year ? 1 : -1;
  }
  toJSON () {
    return {month: this.month, year: this.year};
  }
}
class MonthDayYear {
  constructor (date=new Date ()) {
    if (date instanceof Date) {
      this.month = date.getMonth ();
      this.day = date.getDate ();
      this.year = date.getFullYear ();
    } else if (date instanceof MonthYear) {
      this.month = date.month;
      this.day = 1;
      this.year = date.year;
    } else {
      this.month = date.month;
      this.day = date.day;
      this.year = date.year;
    }
  }
  next () {
    return new MonthDayYear (new Date (this.year, this.month, this.day + 1));
  }
  compare (_mdy) {
    let mdy = new MonthDayYear (_mdy);
    if (this.year === mdy.year) {
      if (this.month === mdy.month) {
        if (this.day === mdy.day) return 0;
        return this.day > mdy.day ? 1 : -1;
      } else return this.month > mdy.month ? 1 : -1;
    } else return this.year > mdy.year ? 1 : -1;
  }
  toJSON () {
    return {month: this.month, day: this.day, year: this.year};
  }
}
// create a tmg client
// let tmg = TMG ()
const TMG = () => {
  // base url
  //const base = 'https://09xunbe0wj.execute-api.us-east-1.amazonaws.com/Prod';
  const base = 'http://localhost:8000';
  // default options for post requests
  const postOpts = {
    method: 'post',
    credentials: 'include',
    headers: new Headers ({
      'Content-Type': 'application/json'
    })
  }
  // post shorthand
  const post = (path, body) => {
    return fetch (`${base}${path}`, {
      ...postOpts,
      body: JSON.stringify (body)
    })
  }
  // quick validation, returns array of missing fields
  const validate = (obj, fields) => {
    return fields.split (' ').filter (f => {
      return !obj [f]
    });
  }
  // object query string
  const qs = (query) => {
    if (!query) return '';
    if (!Object.keys (query).length) return '';
    return '?' + Object.keys (query).map (k => {return `${k}=${query [k]}`}).join ('&');
  }
  // auth section
  // async login method
  const login = async (user) => {
    // return promise
    return new Promise (async (resolve, reject) => {
      // t/c
      try {
        // client side validation, username and password are specified
        let fields = validate (user, 'username password');
        if (fields.length) throw new EmptyFieldError (fields);
        // make the request
        let response = await post ('/api/sessions', user);
        // make sure request was successful and resolve if good, otherwise throw error
        if (!response.ok) throw new RequestStatusError ('POST', '/api/sessions', response.status);
        resolve ();
      } catch (e) {
        reject (e);
      }
    });
  }
  // async sign up method
  const signup = async (user) => {
    // return promise
    return new Promise (async (resolve, reject) => {
      // t/c
      try {
        // client side validation, username email first last and password are specified
        let fields = validate (user,  'username email first last password');
        if (fields.length) throw new EmptyFieldError (fields);
        // make the request
        let response = await post ('/api/users', user);
        // make sure request was successful and resolve if good, otherwise throw error
        if (!response.ok) throw new RequestStatusError ('POST', '/api/users', response.status);
        // receive json response
        let me = await response.json ();
        resolve (me);
      } catch (e) {
        reject (e);
      }
    });
  }
  // logout
  const logout = async () => {
    // promise
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/sessions`, {
          credentials: 'include',
          method: 'delete'
        });
        if (!response.ok) throw new RequestStatusError ('DELETE', '/api/users', response.status);
        resolve ();
      } catch (e) {
        reject (e);
      }
    });
  }
  // get logged in user information
  const me = async () => {
    // promise
    return new Promise (async (resolve, reject) => {
      //t/c
      try {
        let response = await fetch (`${base}/api/me`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', '/api/me', response.status);
        let me = await response.json ();
        resolve (me);
      } catch (e) {
        reject (e);
      }
    })
  }
  // get payment methods
  const getPaymentMethods = async () => {
    // promise
    return new Promise (async (resolve, reject) => {
      //t/c
      try {
        let response = await fetch (`${base}/api/payments/methods`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', '/api/payments/methods', response.status);
        let me = await response.json ();
        resolve (me);
      } catch (e) {
        reject (e);
      }
    })
  }
  // create payment method
  const addPaymentMethod = async (token) => {
    return new Promise (async (resolve, reject) => {
      try {
        let data = await post ('/api/payments/methods', {token});
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // subscribe
  const subscribe = async () => {
    return new Promise (async (resolve, reject) => {
      try {
        let data = await post ('/api/payments');
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // get a single user
  const user = async (id) => {
    // promise
    return new Promise (async (resolve, reject) => {
      //t/c
      try {
        let response = await fetch (`${base}/api/users/${id}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/users/${id}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    })
  }
  // get multiple users
  const users = async (query, id=false) => {
    if (id) return user (id);
    // promise
    return new Promise (async (resolve, reject) => {
      // t/c
      try {
        let response = await fetch (`${base}/api/users${qs (query)}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/users${qs (query)}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    })
  }
  // articles section
  // get articles
  const articles = async (query, id=false) => {
    if (id) return article (id);
    // promise
    return new Promise (async (resolve, reject) => {
      // t/c
      try {
        let response = await fetch (`${base}/api/articles${qs (query)}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/articles${qs (query)}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // get single article
  const article = async (id) => {
    // promise
    return new Promise (async (resolve, reject) => {
      //t/c
      try {
        let response = await fetch (`${base}/api/articles/${id}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/articles/${id}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // share an article
  const shareArticle = async (body) => {
    return new Promise (async (resolve, reject) => {
      try {
        // client side validation, title summary tags url publishedDate are specified
        let fields = validate (body,  'title summary tags url publishedDate');
        if (fields.length) throw new EmptyFieldError (fields);
        // post and resolve with article
        let response = await fetch (`${base}/api/articles`, {
          ...postOpts,
          body: JSON.stringify (body)
        });
        if (!response.ok) throw new RequestStatusError ('POST', `/api/articles`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // forums section
  // get forums
  const forums = async (query={}, id=false) => {
    if (id) return forum (id);
    // promise
    return new Promise (async (resolve, reject) => {
      // t/c
      try {
        let response = await fetch (`${base}/api/forums${qs (query)}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/forums${qs (query)}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    })
  }
  // get a single forum
  const forum = async (id) => {
    // promise
    return new Promise (async (resolve, reject) => {
      //t/c
      try {
        let response = await fetch (`${base}/api/forums/${id}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/forums/${id}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // create a forum
  const createForum = (body) => {
    return new Promise (async (resolve, reject) => {
      try {
        // client side validation, title summary tags url publishedDate are specified
        let fields = validate (body,  'title description');
        if (fields.length) throw new EmptyFieldError (fields);
        // post and resolve with article
        let response = await fetch (`${base}/api/forums`, {
          ...postOpts,
          body: JSON.stringify (body)
        });
        if (!response.ok) throw new RequestStatusError ('POST', `/api/forums`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // comments
  const comments = async (type, id, query={}) => {
    // promise
    return new Promise (async (resolve, reject) => {
      // t/c
      try {
        let response = await fetch (`${base}/api/comments/${type}/${id}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('GET', `/api/comments${type}/${id}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    })
  }
  const createComment = async (type, id, comment) => {
    return new Promise (async (resolve, reject) => {
      try {
        // verify type is valid
        if ('forums articles comments'.split (' ').indexOf (type) === -1) throw new Error (`Type ${type} is not valid, must be forums, articles, or comments`);
        let response = await fetch (`${base}/api/comments/${type}/${id}`, {
          ...postOpts,
          body: JSON.stringify ({comment})
        });
        if (!response.ok) throw new RequestStatusError ('/POST', `${base}/api/${type}/${id}/comments`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // 
  const like = async (type, id) => {
    return new Promise (async (resolve, reject) => {
      try {
        resolve (await post (`/api/likes/${type}/${id}`));
      } catch (e) {
        reject (e);
      }
    });
  }
  // get current election
  const getCurrentElection = async () => {
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/current-election`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('/GET', `${base}/api/current-election`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    })
  }
  // get an election based on month/year
  const getElection = async (my=new MonthYear ()) => {
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/elections/${my.month},${my.year}`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('/GET', `${base}/api/elections/${my.month},${my.year}`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // get current election causes
  const getCauses = async (my=new MonthYear ()) => {
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/elections/${my.month},${my.year}/causes`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('/GET', `${base}/api/elections/${my.month},${my.year}/causes`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // get cause by id
  const getSingleCause = async (id, my=new MonthYear ()) => {
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/elections/${my.month},${my.year}/causes/${id}`);
        let cause = await response.json ();
        resolve (cause);
      } catch (e) {
        reject (e);
      }
    });
  }
  // get cause by user
  const getSingleCauseByUser = async (userId) => {
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/elections/${my.month},${my.year}/causes?user=${userId}`);
        let cause = await response.json ();
        resolve (cause);
      } catch (e) {
        reject (e);
      }
    });
  }
  // /elections/:mm,:yyyy/my-cause
  // get my cause for an election
  const getMyCause = async (my=new MonthYear ()) => {
    return new Promise (async (resolve, reject) => {
      try {
        let response = await fetch (`${base}/api/current-election/my-cause`, {credentials: "include"});
        if (!response.ok) throw new RequestStatusError ('/GET', `${base}/api/current-election/my-cause`, response.status);
        let data = await response.json ();
        resolve (data);
      } catch (e) {
        reject (e);
      }
    });
  }
  // update my cause
  const updateMyCause = async (cause) => {
    return new Promise (async (resolve, reject) => {
      try {
        let updated = await post (`/api/current-election/my-cause`, cause);
        resolve (updated);
      } catch (e) {
        reject (e);
      }
    })
  }
  // check balance of the global fund
  const checkGlobalFund = async () => {
    return new Promise (async (resolve) => {
      try {
        let response = await fetch (`${base}/api/balance`);
        let data = await response.json ();
        let balance = `${data.available [0].amount / 100}`
        resolve ([null, balance]);
      } catch (e) {
        resolve ([e, null]);
      }
    });
  }
  // return a tmg object
  return {
    MonthDayYear,
    MonthYear,
    DateRange,
    login,
    signup,
    logout,
    me,
    getPaymentMethods,
    addPaymentMethod,
    subscribe,
    forums,
    createForum,
    createComment,
    like,
    getElection,
    getCauses,
    comments,
    getMyCause,
    updateMyCause,
    checkGlobalFund
  }
}