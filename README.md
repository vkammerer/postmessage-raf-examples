# postmessage-raf-firebase
An example of using firebase v4 with @vkammerer/postmessage-raf

The main pain point of using firebase within a web worker is authentication,
since a worker can't open authentication popups nor have access to authentication data stored in localStorage.   

One workaround is to use the nodejs API of firebase in the web worker.
