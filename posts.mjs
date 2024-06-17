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
      title: "What is a <code>NullPointerException</code>, and how do I fix it?",
      score: 209,
      post_id: 2,
      body: `What are Null Pointer Exceptions (<code>java.lang.NullPointerException</code>) and what causes them?

      What methods/tools can be used to determine the cause so that you stop the exception from causing the program to terminate prematurely?`,
      tags: [
        "java",
        "nullpointerexception"
      ],
      answers: [
        {
          body: `There are two overarching types of variables in Java:

          1. <i>Primitives</i>: variables that contain data. If you want to manipulate the data in a primitive variable you can manipulate that variable directly. By convention primitive types start with a lowercase letter. For example variables of type <code>int</code> or <code>char</code> are primitives.
      
          2. <i>References</i>: variables that contain the memory address of an <code>Object</code> i.e. variables that refer to an <code>Object</code>. If you want to manipulate the <code>Object</code> that a reference variable refers to you must dereference it. Dereferencing usually entails using <code>.</code> to access a method or field, or using <code>[</code> to index an array. By convention reference types are usually denoted with a type that starts in uppercase. For example variables of type <code>Object</code> are references.
      
      Consider the following code where you declare a variable of primitive type int and don't initialize it:
      <pre><code>
      int x;
      int y = x + x;
      </code></pre>
      These two lines will crash the program because no value is specified for x and we are trying to use x's value to specify y. All primitives have to be initialized to a usable value before they are manipulated.
      
      Now here is where things get interesting. Reference variables can be set to null which means "I am referencing nothing". You can get a null value in a reference variable if you explicitly set it that way, or a reference variable is uninitialized and the compiler does not catch it (Java will automatically set the variable to null).
      
      If a reference variable is set to null either explicitly by you or through Java automatically, and you attempt to dereference it you get a NullPointerException.
      
      The NullPointerException (NPE) typically occurs when you declare a variable but did not create an object and assign it to the variable before trying to use the contents of the variable. So you have a reference to something that does not actually exist.
      
      Take the following code:
      <pre><code>
      Integer num;
      num = new Integer(10);
      </code></pre>
      The first line declares a variable named num, but it does not actually contain a reference value yet. Since you have not yet said what to point to, Java sets it to null.
      
      In the second line, the new keyword is used to instantiate (or create) an object of type Integer, and the reference variable num is assigned to that Integer object.
      
      If you attempt to dereference num before creating the object you get a NullPointerException. In the most trivial cases, the compiler will catch the problem and let you know that "num may not have been initialized," but sometimes you may write code that does not directly create the object.
      
      For instance, you may have a method as follows:
      <pre><code>
      public void doSomething(SomeObject obj) {
         // Do something to obj, assumes obj is not null
         obj.myMethod();
      }
      </code></pre>
      In which case, you are not creating the object obj, but rather assuming that it was created before the doSomething() method was called. Note, it is possible to call the method like this:
      <pre><code>
      doSomething(null);
      </code></pre>
      In which case, obj is null, and the statement obj.myMethod() will throw a NullPointerException.
      
      If the method is intended to do something to the passed-in object as the above method does, it is appropriate to throw the NullPointerException because it's a programmer error and the programmer will need that information for debugging purposes.
      
      In addition to NullPointerExceptions thrown as a result of the method's logic, you can also check the method arguments for null values and throw NPEs explicitly by adding something like the following near the beginning of a method:
      <pre><code>
      // Throws an NPE with a custom error message if obj is null
      Objects.requireNonNull(obj, "obj must not be null");
      </code></pre>
      Note that it's helpful to say in your error message clearly which object cannot be null. The advantage of validating this is that 1) you can return your own clearer error messages and 2) for the rest of the method you know that unless obj is reassigned, it is not null and can be dereferenced safely.
      
      Alternatively, there may be cases where the purpose of the method is not solely to operate on the passed in object, and therefore a null parameter may be acceptable. In this case, you would need to check for a null parameter and behave differently. You should also explain this in the documentation. For example, doSomething() could be written as:
      <pre><code>
      /**
        * @param obj An optional foo for ____. May be null, in which case
        *  the result will be ____.
        */
      public void doSomething(SomeObject obj) {
          if(obj == null) {
             // Do something
          } else {
             // Do something else
          }
      }
      </code></pre>
      Finally, How to pinpoint the exception & cause using Stack Trace
      
          What methods/tools can be used to determine the cause so that you stop the exception from causing the program to terminate prematurely?
      
      Sonar with find bugs can detect NPE. Can sonar catch null pointer exceptions caused by JVM Dynamically
      
      Now Java 14 has added a new language feature to show the root cause of NullPointerException. This language feature has been part of SAP commercial JVM since 2006.
      
      In Java 14, the following is a sample NullPointerException Exception message:
      <pre><code>
          in thread "main" java.lang.NullPointerException: Cannot invoke "java.util.List.size()" because "list" is null
      </code></pre>
      List of situations that cause a NullPointerException to occur
      
      Here are all the situations in which a NullPointerException occurs, that are directly* mentioned by the Java Language Specification:<br>
      
        - Accessing (i.e. getting or setting) an instance field of a null reference. (static fields don't count!)<br>
        - Calling an instance method of a null reference. (static methods don't count!)<br>
        - <code>throw null;</code><br>
        - Accessing elements of a null array.<br>
        - Synchronising on null - synchronized (someNullReference) { ... }<br>
        - Any integer/floating point operator can throw a NullPointerException if one of its operands is a boxed null reference<br>
        - An unboxing conversion throws a <code>NullPointerException</code> if the boxed value is <code>null</code>.<br>
        - Calling super on a null reference throws a NullPointerException. If you are confused, this is talking about qualified superclass constructor invocations:
      <pre><code>
      class Outer {
          class Inner {}
      }
      class ChildOfInner extends Outer.Inner {
          ChildOfInner(Outer o) { 
              o.super(); // if o is null, NPE gets thrown
          }
      }
      </code></pre>
          Using a for (element : iterable) loop to loop through a null collection/array.
      
          <code>switch (foo) { ... }</code> (whether its an expression or statement) can throw a <code>NullPointerException</code> when foo is null.
      
          <code>foo.new SomeInnerClass()</code> throws a NullPointerException when foo is null.
      
          Method references of the form name1::name2 or primaryExpression::name throws a NullPointerException when evaluated when name1 or primaryExpression evaluates to null.
      
          a note from the JLS here says that, someInstance.someStaticMethod() doesn't throw an NPE, because someStaticMethod is static, but someInstance::someStaticMethod still throw an NPE!
      `
        }
      ]
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
