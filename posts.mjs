const posts = {
  posts: [
    {
      title: "lorem ipsus",
      post_id: 0,
      user_id: 1223,
      body: `duikj`,
      score: 2,
      tags: [
        "hack",
        "game",
        "help",
        "REEEEEEEEEE",
        "amogus"
      ],
      answers: [
        {
          user_id: 1023,
          body: "hi, fuck you",
          score: 69420
        },
        {
          user_id: 1030,
          body: "Replying to @1023:\nyea i agree",
          score: 2e457788
        }
      ]
    },
    {
      title: "How do I return the response from an asynchronous call?",
      post_id: 1,
      body: `
      How do I return the response/result from a function <code>foo</code> that makes an asynchronous request?
      
      I am trying to return the value from the callback, as well as assigning the result to a local variable inside the function and returning that one, but none of those ways actually return the response — they all return <code>undefined</code> or whatever the initial value of the variable <code>result</code> is.
      
      <b>Example of an asynchronous function that accepts a callback</b> (using jQuery's <code>ajax</code> function):
      <pre><code>
      function foo() {
          var result;
      
          $.ajax({
              url: '...',
              success: function(response) {
                  result = response;
                  // return response; // <- I tried that one as well
              }
          });
      
          return result; // It always returns \`undefined\`
      }
      </code></pre>
      <b>Example using Node.js:</b>
      <pre><code>
      function foo() {
          var result;
      
          fs.readFile("path/to/file", function(err, data) {
              result = data;
              // return data; // <- I tried that one as well
          });
      
          return result; // It always returns \`undefined\`
      }
      </code></pre>
      
      <b>Example using the <code>then</code> block of a promise:</b>
      <pre><code>
      function foo() {
          var result;
      
          fetch(url).then(function(response) {
              result = response;
              // return response; // <- I tried that one as well
          });
      
          return result; // It always returns \`undefined\`
      }
      </code></pre>`,
      score: 6702,
      tags: [
        "javascript",
        "ajax",
        "asynchronous"
      ],
      answers: [
        {
          body: `<h2>The problem</h2>

          The A in Ajax stands for asynchronous. That means sending the request (or rather receiving the response) is taken out of the normal execution flow. In your example, <code>$.ajax</code> returns immediately and the next statement, <code>return result;</code>, is executed before the function you passed as success callback was even called.<br>
          <br>
          Here is an analogy which hopefully makes the difference between synchronous and asynchronous flow clearer:
          <h3>Synchronous</h3>
          
          Imagine you make a phone call to a friend and ask him to look something up for you. Although it might take a while, you wait on the phone and stare into space, until your friend gives you the answer that you needed. <br>
          
          The same is happening when you make a function call containing "normal" code:
          <pre><code>
          function findItem() {
              var item;
              while(item_not_found) {
                  // search
              }
              return item;
          }
          var item = findItem();
          
          // Do something with item
          doSomethingElse();
          </code></pre>
          
          Even though <code>findItem</code> might take a long time to execute, any code coming after var item = findItem(); has to wait until the function returns the result.
          <h3>Asynchronous</h3>
          
          You call your friend again for the same reason. But this time you tell him that you are in a hurry and he should call you back on your mobile phone. You hang up, leave the house, and do whatever you planned to do. Once your friend calls you back, you are dealing with the information he gave to you.
          
          That's exactly what's happening when you do an Ajax request.
          <pre><code>
          findItem(function(item) {
              // Do something with the item
          });
          doSomethingElse();
          </code></pre>
          Instead of waiting for the response, the execution continues immediately and the statement after the Ajax call is executed. To get the response eventually, you provide a function to be called once the response was received, a callback (notice something? call back ?). Any statement coming after that call is executed before the callback is called.
          
          <h2>Solution(s)</h2>
          
          Embrace the asynchronous nature of JavaScript! While certain asynchronous operations provide synchronous counterparts (so does "Ajax"), it's generally discouraged to use them, especially in a browser context.
          <br><br>
          Why is it bad do you ask?
          <br><br>
          JavaScript runs in the UI thread of the browser and any long-running process will lock the UI, making it unresponsive. Additionally, there is an upper limit on the execution time for JavaScript and the browser will ask the user whether to continue the execution or not.
          
          All of this results in a really bad user experience. The user won't be able to tell whether everything is working fine or not. Furthermore, the effect will be worse for users with a slow connection.
          
          In the following we will look at three different solutions that are all building on top of each other:
          
              Promises with async/await (ES2017+, available in older browsers if you use a transpiler or regenerator)
              Callbacks (popular in node)
              Promises with then() (ES2015+, available in older browsers if you use one of the many promise libraries)
          
          All three are available in current browsers, and node 7+.
          ES2017+: Promises with async/await
          
          The ECMAScript version released in 2017 introduced syntax-level support for asynchronous functions. With the help of async and await, you can write asynchronous in a "synchronous style". The code is still asynchronous, but it's easier to read/understand.
          
          async/await builds on top of promises: an async function always returns a promise. await "unwraps" a promise and either result in the value the promise was resolved with or throws an error if the promise was rejected.
          
          Important: You can only use await inside an async function or in a JavaScript module. Top-level await is not supported outside of modules, so you might have to make an async IIFE (Immediately Invoked Function Expression) to start an async context if not using a module.
          
          You can read more about async and await on MDN.
          
          Here is an example that elaborates the delay function <code>findItem()</code> above:
          <pre><code>
          // Using 'superagent' which will return a promise.
          var superagent = require('superagent')
          
          // This is isn't declared as \`async\` because it already returns a promise
          function delay() {
            // \`delay\` returns a promise
            return new Promise(function(resolve, reject) {
              // Only \`delay\` is able to resolve or reject the promise
              setTimeout(function() {
                resolve(42); // After 3 seconds, resolve the promise with value 42
              }, 3000);
            });
          }
          
          async function getAllBooks() {
            try {
              // GET a list of book IDs of the current user
              var bookIDs = await superagent.get('/user/books');
              // wait for 3 seconds (just for the sake of this example)
              await delay();
              // GET information about each book
              return superagent.get('/books/ids='+JSON.stringify(bookIDs));
            } catch(error) {
              // If any of the awaited promises was rejected, this catch block
              // would catch the rejection reason
              return null;
            }
          }
          
          // Start an IIFE to use \`await\` at the top level
          (async function(){
            let books = await getAllBooks();
            console.log(books);
          })();
          </code></pre>
          Current browser and node versions support async/await. You can also support older environments by transforming your code to ES5 with the help of regenerator (or tools that use regenerator, such as Babel).
          A <code>let function</code> accepts callbacks
          
          A callback is when function 1 is passed to function 2. Function 2 can call function 1 whenever it is ready. In the context of an asynchronous process, the callback will be called whenever the asynchronous process is done. Usually, the result is passed to the callback.
          
          In the example of the question, you can make foo accept a callback and use it as success callback. So this
          <pre><code>
          var result = foo();
          // Code that depends on 'result'
          </code></pre>
          becomes
          <pre><code>
          
          foo(function(result) {
              // Code that depends on 'result'
          });
          </code></pre>
          Here we defined the function "inline" but you can pass any function reference:
          <pre><code>
          
          function myCallback(result) {
              // Code that depends on 'result'
          }
          
          foo(myCallback);
          </code></pre>
          foo itself is defined as follows:
          <pre><code>
          
          function foo(callback) {
              $.ajax({
                  // ...
                  success: callback
              });
          }
          </code></pre>
          callback will refer to the function we pass to foo when we call it and we pass it on to success. I.e. once the Ajax request is successful, $.ajax will call callback and pass the response to the callback (which can be referred to with result, since this is how we defined the callback).
          
          You can also process the response before passing it to the callback:
          <pre><code>
          function foo(callback) {
              $.ajax({
                  // ...
                  success: function(response) {
                      // For example, filter the response
                      callback(filtered_response);
                  }
              });
          }
          </code><.pre>
          It's easier to write code using callbacks than it may seem. After all, JavaScript in the browser is heavily event-driven (DOM events). Receiving the Ajax response is nothing else but an event. Difficulties could arise when you have to work with third-party code, but most problems can be solved by just thinking through the application flow.`
        }
      ]
    },
    {
      title: "mock2",
      post_id: 2,
      body: "ipsum",
      score: 696969,
    },
    {
      title: "mock3",
      post_id: 3,
      body: "dolor",
      score: -69420
    },
  ]
}

export default posts
