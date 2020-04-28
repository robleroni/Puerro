# Conclusion

The thesis for this project was, that big frameworks are not always needed for frontend Web Applications and that one can get very far by using a minimal amount of abstractions. 

The work done in the showcase project "[Huerto](../huerto)" shows that different problems call for different approaches. The more complex an application gets, the more helpful it is to use abstractions.

For large scale applications it is also very useful to hold to a specific architecture. In the Huerto example a variant of MVC is used. If used it is very important to hold to the principles given by the pattern used, to ensure consistency. Consistency is imperative in large scale web apps since it makes the codebase clean, maintainable and prevents a lot of bugs. 

To make JavaScript code more testable it is advisable to separate business logic from DOM manipulation. That way the business logic can be tested independently and deterministically without depending on a specific environment.

Out of scope for this project were asynchronous side effects, like API calls. With such side effects and interaction with other systems web applications become even more complex and it is much more important to maintain a clean codebase.

Frameworks are not inherently bad! A good deal of frameworks have a big community which provides extensions and other solution for a lot of problems that might occur. Some frameworks are also backed and developed by big companies which gives them stability. Frameworks can be quite restrictive but that is also an advantage, it gives structure to a codebase. This structure is also good for teams with rotating members. For instance, a new hire which is proficient in Angular knows how an Angular project looks like and understands the code faster than they would with an application without a framework.

All that to say, frameworks tend to be overused and are not needed for every project. The dependency management alone can become a nightmare very quickly. That's why our recommendation is:

**Begin with a zero dependency approach and add dependencies conservatively when the need arises.**

[← MVC](05-MVC.md)

