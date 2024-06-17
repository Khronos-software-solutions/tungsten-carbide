const posts = {
  posts: [
    {
      title: "lorem ipsus",
      post_id: 0,
      user_id: 1223,
      body: `Ambatakum`,
      score: -22,
      tags: [
        "bussin"
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
          </code></pre>
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
    {
      title: "How do I install my CPU",
      post_id: 4,
      user_id: 1001,
      body: `I just bought a new PC, and I am already stuck on how to install the CPU, can anyone help?`,
      score: -204,
      tags: [
        "Hardware",
         "Computerbuiling",
         "frequently asked questions",
         "beginner computer builder"
      ],
      answers: [
        {
          user_id: 1023,
          body: "Go see a tutorial",
          score: 69
        },
        {
          user_id: 1030,
          body: "shall I google it for you",
          score: 24577
        },
        {
          user_id: 1030,
          body: "I recommend you see a tutorial for this issue, it is a delicate process",
          score: 96594
        }
      ]
    },
    {
      title: "Where should I put my GPU",
      post_id: 5,
      user_id: 1002,
      body: `I am installign my GPU, but I have two PCI-e slots, where should I put it?`,
      score: 5890,
      tags: [
        "Hardware",
        "GPUissues",
        "Frequently asked questions"
      ],
      answers: [
        {
          user_id: 1030,
          body: "ALsways put your GPU in the upper slot, the most bottom slot suffers from lag and besides, it uses most of the thime a lower bandwidth",
          score: 697
        },
        {
          user_id: 1030,
          body: "Nah, I use iGPU",
          score: -9999
        },
      ]
    },
    {
          title: "Best CPU cooler for 7600x",
          post_id: 6,
          user_id: 1001,
          body: `I am about to buy a computer with a ryzen 7600x, what cooler should I buy alongside?`,
          score: 199,
          tags: [
            "Hardware",
             "Computerbuiling",
             "frequently asked questions",
          ],
          answers: [
            {
              user_id: 1023,
              body: "A CPU with over 80 watts will require a water cooler, I learned that the hard way",
              score: 69676
            },
            {
              user_id: 1030,
              body: "Use a big air cooler like the AK620, or a moderate water cooler",
              score: 24577
            },
            {
              user_id: 1030,
              body: "Grill a steak on your CPU",
              score: 82475929
            }
          ]
        },
        {
          title: "Is DDR5 worth it",
          post_id: 7,
          user_id: 1428,
          body: `I am about to buy a 13th gen intel motherboard, but should I go for DDR5 or just DDR4?`,
          score: 20,
          tags: [
            "Hardware",
            "PCpart", 
            "financial"
          ],
          answers: [
            {
              user_id: 9901,
              body: "I would go with DDR5 just for futureproofing",
              score: 10
            },
            {
              user_id: 2234,
              body: "Depends, If you want a cheaper computer, DDR4 is the best option, but DDR5 is better for futureproofing",
              score: 66
            },
            {
              user_id: 6685,
              body: "Faster is better, go for DDR5",
              score: 5
            },
          ]
        },
        {
          title: "GPU noise",
          post_id: 8,
          user_id: 8795,
          body: `My GPU is making alot of noise like a lawnmower, Is that normal, It does work`,
          score: 305,
          tags: [
            "Hardware",
            "gpu",
            "coilwhine"
          ],
          answers: [
            {
              user_id: 5301,
              body: "What you have is something called coilwhine, It is normal and it does not affect performance, however, if you are hindered by the noise, than you can google some trick to limit the damage.",
              score: 209
            },
            {
              user_id: 1230,
              body: "It is normal, you can put rubber bushing between the case and your GPu to limit noise.",
              score: 12
            },
            {
              user_id: 1009,
              body: "Just buy a better gpu",
              score: -5
            },
            {
              user_id: 1010,
              body: "It usually dissipates over time, don't you worry",
              score: 13
            },
          ]
        },
        {
          title: "Do you need Dram for better Nvme performance",
          post_id: 9,
          user_id: 3334,
          body: `I am about to buy a new drive for my editing rig, do I need Dram for my SSD?`,
          score: 367,
          tags: [
            "Hardware",
            "storage",
            "computerbuilding"
          ],
          answers: [
            {
              user_id: 2002,
              body: "Yes, for editing and large files Dram is better, it will give better responiveness and faster random speeds",
              score: 439
            },
          ]
        },
        {
          title: "How much PC fans",
          post_id: 9,
          user_id: 9785,
          body: `I am going to ugrande my case from my open-air test bench, How many case fans do I need`,
          score: 698,
          tags: [
            "Hardware",
          ],
          answers: [
            {
              user_id: 9971,
              body: "At least one, but the best thing to do is have one exhaust fan for every intake fan, or have more intake than exhaust",
              score: 200
            },
            {
              user_id: 9888,
              body: "Have at least one fan",
              score: 5
            },
            {
              user_id: 6246,
              body: "Depends on case size, Bigger cases sometimes perform better with negative airflow and micro cases also like more negative airflow",
              score: 15
            },
            {
              user_id: 3344,
              body: "I mostly depends on the cooling solutions for your GPU and CPU",
              score: 4
            },
            {
              user_id: 5893,
              body: "Just use all case fan mounts, and you'll be good to go",
              score: -2
            },
          ]
        }
      ]
    }


export default posts
