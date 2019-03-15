# Season 01 - The Beginning of Huerto

## Conversation

> > **Customer**: Yo, I've heard that you are studying something with computers. Can you create a quick homepage for me?
>
> > **Developer**: Hey! The web is awesome, but computer science is about much more than the web. Not every computer scientist creates content for the web. And it's called website - not homepage.
>
> > **Customer**: Yes! Website! See, you know what I'm talking about. I want to start my own vegetable garden and I think that I need some technological support. I've heard a lot about Big Data, Cloud and AI lately. That's why I want a website!
>
> > **Developer**: So you need a web application to manage your vegetable garden.. What should it be able to do?
>
> > **Customer**: Good question! I don't really know yet. I'm a little forgetful, so it would be nice if I can enter my vegetables. With this I could see what I have planted in my garden.
>
> > **Developer**: I am currently experimenting a bit with the creation of web applications anyway. I could probably use your idea for that. I'll create a simple solution and come back to you.

## Developer Thoughts

### Coding for the Web

Coding for the web means that the end-user can access the result trough a browser (e.g.: Chrome, Firefox, Safari, Edge or - unfortunately - Internet Explorer).

A browser can request data from different sources (servers) in the web and display the received content.
This content is usually a combination between these 3 different programming languages:

- **HTML**: Describes the structure of the page
- **CSS**: Describes the presentation of the page
- **JavaScript**: Adds behaviour to the page - and makes it more dynamic

A website is **static** when its content is fixed. It only uses HTML and CSS and there is no way to interact with it (other than linking to other pages). If you would print it out, it would still work.

A website is **dynamic** when its content can change. This can be achieved with server-side (backend) or client-side (frontend) scripting. When the content changes from being just informational to being more interactive, we say that it is a **web application**.

With **Server-Side Scripting**, the script runs on the server, modifies the web page and sends the result back to the client. There are multiple languages available for it, like _PHP_, _Ruby_, etc.

With **Client-Side Scripting** the script runs in the browser of the user. This is being achieved with the delivered **JavaScript**. Therefore, it runs after the content is received.

Both scripting approaches have their advantages and disadvantages.

One disadvantage of the server-side scripting is, that with every request the browser needs to reload the whole page. This is very time consuming and doesn't provide a great user experience.

Amongst other things, that is why the modern way to develop web application is with client-side scripting.

Client-side scripting allows for **Ajax** calls. With these the browser can asynchronously load only the data needed and dynamically change the web page with JavaScript. This provides a much better user experience as the page doesn't need to reload completely.

### Ground Rules

This project is going to be implemented with the client-side scripting (frontend) approach. To make the project usable in a real-life scenario, we would also need a backend part which delivers and stores the data. However, we are only interested in how to build the frontend part and therefore simply ignore or simulate the backend.

One challenge is to support multiple browsers and versions. Since there are different companies which develop browsers, everyone behaves a little different.
Each company has to decide how to handle the received content (HTML, CSS, JS).

Luckily, there are standards and the modern browsers behave mostly the same.
To fully support different browsers however, we would either need to develop a little different version for each browser (and version) or use a compiler to handle this.

For this project we use the following standards:

- HTML5
- CSS3
- ES6 (JavaScript version)

Use a backword compiler like [Babel](https://babeljs.io/) if it doesn't run in your browser.

## Researches

_// **TODO:** Continiue_

- Should I use a framework and tooling around it to create the web application.

- Should I start small and try to implement the first requirement with pure HTML and JavaScript.
- It should be testable right away.
  - Testframeworks?

## User Stories

- As a user I want to add a vegetable to a list.

  _// **TODO:** Maybe this section is not needed?_

## Result

We are going for the most simple way and start with a single input element with pure HTML and JavaScript.

| Evaluation                     | Implementation (Demo)                     | Test Results           |
| ------------------------------ | ----------------------------------------- | ---------------------- |
| [Season 01](../../research/01) | [01 - The Beginning of Huerto](demo.html) | [Tests 01](tests.html) |
