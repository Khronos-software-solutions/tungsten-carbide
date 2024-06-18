const posts = {
  posts: [
    {
      title: "Why is processing a sorted array faster than processing an unsorted array?",
      post_id: 0,
      score: 27270,
      tags: [
        "java",
        "c++",
        "performance",
        "cpu-architecture",
        "branch-prediction"
      ],
      body: `In this C++ code, sorting the data (<em>before</em> the timed region) makes the primary loop ~6x faster:
      <pre><code>
      #include &lt;algorithm&gt;
      #include &lt;ctime&gt;
      #include &lt;iostream&gt;
      
      int main()
      {
          // Generate data
          const unsigned arraySize = <span class="hljs-number">32768;
          int data[arraySize];
      
          for (unsigned c = 0; c &lt; arraySize; ++c)
              data[c] = std::rand() % 256;
      
          // !!! With this, the next loop runs faster.
          std::sort(data, data + arraySize);
      
          // Test
          clock_t start = clock();
          long long sum = 0;
          for (unsigned i = 0; i &lt; 100000; ++i)
          {
              for (unsigned c = 0; c &lt; arraySize; ++c)
              {   // Primary loop.
                  if (data[c] &gt;= 128)
                      sum += data[c];
              }
          }
      
          double elapsedTime = static_cast&lt;double&gt;(clock()-start) / CLOCKS_PER_SEC;
      
          std::cout &lt;&lt; elapsedTime &lt;&lt; '\n';
          std::cout &lt;&lt; "sum = " &lt;&lt; sum &lt;&lt; '\n';
      }
      </code></pre>
      <ul>
      <li>Without <code>std::sort(data, data + arraySize);</code>, the code runs in 11.54 seconds.</li>
      <li>With the sorted data, the code runs in 1.93 seconds.</li>
      </ul>
      (Sorting itself takes more time than this one pass over the array, so it's not actually worth doing if we needed to calculate this for an unknown array.)
      <hr>
      Initially, I thought this might be just a language or compiler anomaly, so I tried Java:
      <pre class="lang-java s-code-block"><code class="hljs language-java">import java.util.Arrays;
      import java.util.Random;
      
      public class Main
      {
          public static void main(String[] args)
          {
              // Generate data
              int arraySize = 32768;
              int data[] = new int[arraySize];
      
              Random rnd = new Random(0);
              for (int c = 0; c &lt; arraySize; ++c)
                  data[c] = rnd.nextInt() % 256;
      
              // !!! With this, the next loop runs faster
              Arrays.sort(data);
      
              // Test
              long start = System.nanoTime();
              long sum = 0;
              for (int i = 0; i &lt; 100000; ++i)
              {
                  for (int c = 0; c &lt; arraySize; ++c)
                  {   // Primary loop.
                      if (data[c] &gt;= 128)
                          sum += data[c];
                  }
              }
      
              System.out.println((System.nanoTime() - start) / 1000000000.0);
              System.out.println("sum = " + sum);
          }
      }
      </code></pre>
      With a similar but less extreme result.
      <hr>
      My first thought was that sorting brings the data into the <a href="https://en.wikipedia.org/wiki/CPU_cache" rel="noreferrer">cache</a>, but that's silly because the array was just generated.
      <ul>
      <li>What is going on?</li>
      <li>Why is processing a sorted array faster than processing an unsorted array?</li>
      </ul>
      The code is summing up some independent terms, so the order should not matter`,
      answers: [
        {
          score: 35002,
          body: `
          <strong>You are a victim of <a href="https://en.wikipedia.org/wiki/Branch_predictor" rel="noreferrer">branch prediction</a> fail.</strong>
<hr>
<h2>What is Branch Prediction?</h2>
Consider a railroad junction:
Now for the sake of argument, suppose this is back in the 1800s - before long-distance or radio communication.
You are a blind operator of a junction and you hear a train coming. You have no idea which way it is supposed to go. You stop the train to ask the driver which direction they want. And then you set the switch appropriately.
<em>Trains are heavy and have a lot of inertia, so they take forever to start up and slow down.</em>
Is there a better way? You guess which direction the train will go!
<ul>
<li>If you guessed right, it continues on.</li>
<li>If you guessed wrong, the driver will stop, back up, and yell at you to flip the switch. Then it can restart down the other path.</li>
</ul>
<p><strong>If you guess right every time</strong>, the train will never have to stop.<br>
<strong>If you guess wrong too often</strong>, the train will spend a lot of time stopping, backing up, and restarting.</p>
<hr>
<strong>Consider an if-statement:</strong> At the processor level, it is a branch instruction:
<img src="https://i.sstatic.net/pyfwC.png" alt="if(x >= 128) compiles into a jump-if-less-than processor instruction.">
You are a processor and you see a branch. You have no idea which way it will go. What do you do? You halt execution and wait until the previous instructions are complete. Then you continue down the correct path.
<em>Modern processors are complicated and have long pipelines. This means they take forever to "warm up" and "slow down".</em>
Is there a better way? You guess which direction the branch will go!
<ul>
<li>If you guessed right, you continue executing.</li>
<li>If you guessed wrong, you need to flush the pipeline and roll back to the branch. Then you can restart down the other path.</li>
</ul>
<p><strong>If you guess right every time</strong>, the execution will never have to stop.<br>
<strong>If you guess wrong too often</strong>, you spend a lot of time stalling, rolling back, and restarting.</p>
<hr>
This is branch prediction. I admit it's not the best analogy since the train could just signal the direction with a flag. But in computers, the processor doesn't know which direction a branch will go until the last moment.
How would you strategically guess to minimize the number of times that the train must back up and go down the other path? You look at the past history! If the train goes left 99% of the time, then you guess left. If it alternates, then you alternate your guesses. If it goes one way every three times, you guess the same...
<em><strong>In other words, you try to identify a pattern and follow it.</strong></em> This is more or less how branch predictors work.
Most applications have well-behaved branches. Therefore, modern branch predictors will typically achieve &gt;90% hit rates. But when faced with unpredictable branches with no recognizable patterns, branch predictors are virtually useless.
Further reading: <a href="https://en.wikipedia.org/wiki/Branch_predictor" rel="noreferrer">"Branch predictor" article on Wikipedia</a>.
<hr>
<h2>As hinted from above, the culprit is this if-statement:</h2>
<pre><code class="hljs language-haskell">if (data[c] &gt;= 128)
    sum += data[c];
</code></pre>
Notice that the data is evenly distributed between 0 and 255. When the data is sorted, roughly the first half of the iterations will not enter the if-statement. After that, they will all enter the if-statement.
This is very friendly to the branch predictor since the branch consecutively goes the same direction many times. Even a simple saturating counter will correctly predict the branch except for the few iterations after it switches direction.
<strong>Quick visualization:</strong>
<pre class="lang-none s-code-block"><code>T = branch taken
N = branch not taken

data[] = 0, 1, 2, 3, 4, ... 126, 127, 128, 129, 130, ... 250, 251, 252, ...
branch = N  N  N  N  N  ...   N    N    T    T    T  ...   T    T    T  ...

       = NNNNNNNNNNNN ... NNNNNNNTTTTTTTTT ... TTTTTTTTTT  (easy to predict)
</code></pre>
However, when the data is completely random, the branch predictor is rendered useless, because it can't predict random data. Thus there will probably be around 50% misprediction (no better than random guessing).
<pre class="lang-none s-code-block"><code>data[] = 226, 185, 125, 158, 198, 144, 217, 79, 202, 118,  14, 150, 177, 182, ...
branch =   T,   T,   N,   T,   T,   T,   T,  N,   T,   N,   N,   T,   T,   T  ...

       = TTNTTTTNTNNTTT ...   (completely random - impossible to predict)
</code></pre>
<hr>
<strong>What can be done?</strong>
If the compiler isn't able to optimize the branch into a conditional move, you can try some hacks if you are willing to sacrifice readability for performance.
Replace:
<pre><code class="hljs language-haskell">if (data[c] &gt;= 128)
    sum += data[c];
</code></pre>
with:
<pre><code>int t = (data[c] - 128) &gt;&gt; 31;
sum += ~t &amp; data[c];
</code></pre>
This eliminates the branch and replaces it with some bitwise operations.
<sub>(Note that this hack is not strictly equivalent to the original if-statement. But in this case, it's valid for all the input values of <code>data[]</code>.)</sub>
<strong>Benchmarks: Core i7 920 @ 3.5 GHz</strong>
C++ - Visual Studio 2010 - x64 Release
<div class="s-table-container"><table class="s-table">
<thead>
<tr>
<th>Scenario</th>
<th>Time (seconds)</th>
</tr>
</thead>
<tbody>
<tr>
<td>Branching - Random data</td>
<td>11.777</td>
</tr>
<tr>
<td>Branching - Sorted data</td>
<td>2.352</td>
</tr>
<tr>
<td>Branchless - Random data</td>
<td>2.564</td>
</tr>
<tr>
<td>Branchless - Sorted data</td>
<td>2.587</td>
</tr>
</tbody>
</table></div>
<p>Java - NetBeans 7.1.1 JDK 7 - x64</p>
<div class="s-table-container"><table class="s-table">
<thead>
<tr>
<th>Scenario</th>
<th>Time (seconds)</th>
</tr>
</thead>
<tbody>
<tr>
<td>Branching - Random data</td>
<td>10.93293813</td>
</tr>
<tr>
<td>Branching - Sorted data</td>
<td>5.643797077</td>
</tr>
<tr>
<td>Branchless - Random data</td>
<td>3.113581453</td>
</tr>
<tr>
<td>Branchless - Sorted data</td>
<td>3.186068823</td>
</tr>
</tbody>
</table></div>
Observations:
<ul>
<li><strong>With the Branch:</strong> There is a huge difference between the sorted and unsorted data.</li>
<li><strong>With the Hack:</strong> There is no difference between sorted and unsorted data.</li>
<li>In the C++ case, the hack is actually a tad slower than with the branch when the data is sorted.</li>
</ul>
A general rule of thumb is to avoid data-dependent branching in critical loops (such as in this example).
<hr>
<strong>Update:</strong>
<ul>
<li>GCC 4.6.1 with <code>-O3</code> or <code>-ftree-vectorize</code> on x64 is able to generate a conditional move, so there is no difference between the sorted and unsorted data - both are fast.  This is called "if-conversion" (to branchless) and is necessary for vectorization but also sometimes good for scalar.
(Or somewhat fast: for the already-sorted case, <code>cmov</code> can be slower especially if GCC puts it on the critical path instead of just <code>add</code>, especially on Intel before Broadwell where <code>cmov</code> has 2-cycle latency: <em><a href="https://stackoverflow.com/questions/28875325/gcc-optimization-flag-o3-makes-code-slower-than-o2">gcc optimization flag -O3 makes code slower than -O2</a></em>)
</li>
<li>VC++ 2010 is unable to generate conditional moves for this branch even under <code>/Ox</code>.
</li>
<li><a href="https://en.wikipedia.org/wiki/Intel_C++_Compiler" rel="noreferrer">Intel C++ Compiler</a> (ICC) 11 does something miraculous. It <a href="https://en.wikipedia.org/wiki/Loop_interchange" rel="noreferrer">interchanges the two loops</a>, thereby hoisting the unpredictable branch to the outer loop. Not only is it immune to the mispredictions, it's also twice as fast as whatever VC++ and GCC can generate! In other words, ICC took advantage of the test-loop to defeat the benchmark...
</li>
<li>If you give the Intel compiler the branchless code, it just outright vectorizes it... and is just as fast as with the branch (with the loop interchange).
</li>
</ul>
<ul>
<li>Clang also vectorizes the <code>if()</code> version, as will GCC 5 and later with <code>-O3</code>, even though it takes quite a few instructions to sign-extend to the 64-bit sum on x86 without SSE4 or AVX2.  (<code>-march=x86-64-v2</code> or <code>v3</code>).  See <em><a href="https://stackoverflow.com/questions/66521344/why-is-processing-an-unsorted-array-the-same-speed-as-processing-a-sorted-array">Why is processing an unsorted array the same speed as processing a sorted array with modern x86-64 clang?</a></em></li>
</ul>
This goes to show that even mature modern compilers can vary wildly in their ability to optimize code...`
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
        "JavaScript",
        "JQuery",
        "Ajax",
        "Async"
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
          It's easier to write code using callbacks than it may seem. After all, JavaScript in the browser is heavily event-driven (DOM events). Receiving the Ajax response is nothing else but an event. Difficulties could arise when you have to work with third-party code, but most problems can be solved by just thinking through the application flow.`,
          score: 35002
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
        "Software",
        "Programming",
        "Bug/Error",
        "Java",
        "NullPointerException"
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
      
          a note from the JLS here says that, someInstance.someStaticMethod() doesn't throw an NPE, because someStaticMethod is static, but someInstance::someStaticMethod still throw an NPE!`,
          score: 4203
        },
        {
          body: `<code>NullPointerException</code>s are exceptions that occur when you try to use a reference that points to no location in memory (null) as though it were referencing an object.  Calling a method on a null reference or trying to access a field of a null reference will trigger a <code>NullPointerException</code>.  These are the most common, but other ways are listed on the <a href="http://docs.oracle.com/javase/7/docs/api/java/lang/NullPointerException.html" rel="noreferrer"><code>NullPointerException</code></a> javadoc page.<br>
Probably the quickest example code I could come up with to illustrate a <code>NullPointerException</code> would be:<br>
<pre><code>public class Example {

    public static void main(String[] args) {
        Object obj = null;
        obj.hashCode();
    }

}
</code></pre>
On the first line inside <code>main</code>, I'm explicitly setting the <code>Object</code> reference <code>obj</code> equal to <code>null</code>.  This means I have a reference, but it isn't pointing to any object.  After that, I try to treat the reference as though it points to an object by calling a method on it.  This results in a <code>NullPointerException</code> because there is no code to execute in the location that the reference is pointing.<br>
(This is a technicality, but I think it bears mentioning: A reference that points to null isn't the same as a C pointer that points to an invalid memory location.  A null pointer is literally not pointing <i>anywhere</i>, which is subtly different than pointing to a location that happens to be invalid.)`,
          score: 969
        }
      ]
    },
    {
      title: "How do I install my CPU?",
      post_id: 4,
      user_id: 1001,
      body: `I just bought a new PC, and I am already stuck on how to install the CPU, can anyone help?`,
      score: -204,
      tags: [
        "Hardware",
        "PC building",
        "PC Components",
        "Processor"
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
          score: 247
        },
        {
          user_id: 1030,
          body: "I recommend you see a tutorial for this issue, it is a delicate process",
          score: 994
        }
      ]
    },
    {
      title: "Where should I put my GPU?",
      post_id: 5,
      user_id: 1002,
      body: `I am installing my GPU, but I have two PCI-e slots, where should I put it?`,
      score: 34,
      tags: [
        "Hardware",
        "PC components",
        "Optimization",
        "GPU"
      ],
      answers: [
        {
          user_id: 1023,
          body: "Always put your GPU in the upper slot, the most bottom slot suffers from lag and besides, the lower slot has a lower bandwidth",
          score: 697
        },
        {
          user_id: 1030,
          body: "Nah, I use iGPU",
          score: -328
        },
      ],
    },
    {
      title: "Best CPU cooler for 7600X",
      post_id: 6,
      user_id: 1001,
      body: `I am about to buy a computer with a Ryzen 7600X, what cooler should I buy alongside?`,
      score: 129,
      tags: [
        "Hardware",
        "PC building",
        "Cooling"
      ],
      answers: [
        {
          user_id: 1023,
          body: "A CPU with over 80 watts will require a water cooler, I learned that the hard way",
          score: 676
        },
        {
          user_id: 1030,
          body: "Use a big air cooler like the AK620, or a moderate water cooler",
          score: 277
        },
        {
          user_id: 1030,
          body: "Grill a steak on your CPU",
          score: 82475929
        }
      ]
    },
    {
      title: "Is DDR5 worth it?",
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
          body: "I would go with DDR5 just for future-proofing",
          score: 10
        },
        {
          user_id: 2234,
          body: "Depends, If you want a cheaper computer, DDR4 is the best option, but DDR5 is better for future-proofing",
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
      body: `My GPU is making a lot of noise like a lawnmower, Is that normal, It does work`,
      score: 305,
      tags: [
        "Hardware",
        "PC Hardware",
        "GPU",
        "Issue"
      ],
      answers: [
        {
          user_id: 5301,
          body: "What you have is something called coil whine, It is normal and it does not affect performance, however, if you are hindered by the noise, than you can google some trick to limit the damage.",
          score: 20
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
      title: "Do you need DRAM for better NVMe performance",
      post_id: 9,
      user_id: 3334,
      body: `I am about to buy a new drive for my editing rig, do I need DRAM for my SSD?`,
      score: 367,
      tags: [
        "Hardware",
        "PC Hardware",
        "PC Building",
        "Storage",
        "Solid State Drive",
        "Random Access Memory",
        "DDR5"
      ],
      answers: [
        {
          user_id: 2002,
          body: "Yes, for editing and large files Dram is better, it will give better responsiveness and faster random speeds",
          score: 439
        },
      ]
    },
    {
      title: "How many PC fans do I need?",
      post_id: 9,
      user_id: 9785,
      body: `I am going to upgrade my case from my open-air test bench, How many case fans do I need`,
      score: 698,
      tags: [
        "Hardware",
        "PC Hardware",
        "Cooling",
      ],
      answers: [
        {
          user_id: 9971,
          body: "At least one, but the best thing to do is have one exhaust fan for every intake fan, or have more intake than exhaust",
          score: 27
        },
        {
          user_id: 9888,
          body: "You should use at least one",
          score: 5
        },
        {
          user_id: 6246,
          body: "Depends on case size, Bigger cases sometimes perform better with negative airflow and micro cases also like more negative airflow",
          score: 15
        },
        {
          user_id: 3344,
          body: "It mostly depends on the cooling solutions for your GPU and CPU",
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
