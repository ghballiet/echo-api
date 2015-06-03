# amazon-echo-api

This is (almost, kind of) an API for Amazon
Echo. [Video Demonstration][youtube]

**This code is not for the faint of heart.** I wrote it in about three
hours, the day after I got my Echo, and there are a lot of
improvements to be made. The original goal was just a
proof-of-concept, to see if I could make Echo do what I wanted. My
goal with releasing the source is to help out other like-minded Echo
owners.

## Prerequisites

- **Wolfram Alpha API Key:** this is used for converting the
  plain-text numbers that Echo records (e.g., "seventy three") into
  integers that can be used to set the temperature. Maybe there's
  another Node package out there to do this, but this seemed like the
  easiest way to get it working. [Get a key here.][wolfram]
- **Username for your Hue:** if you're not messing with Hue, then
  don't worry about it. This was pretty easy to do in the Node REPL by
  loading [node-hue-api][hue-api] and just typing in the
  commands. Later versions of this app should generate a new username
  (assuming it doesn't have one saved) and save it for use later.

## Amazon Echo Credentials

I haven't integrated with any actual Amazon login systems yet. For
now, in order to connect this application to your Echo, you'll need to
do the following:

1. Using Chrome, go to http://echo.amazon.com and sign in.
1. Open the developer tools (Cmd+Shift+J on Mac, or Ctrl+Shift+J on
   Windows).
1. On the page, click on your Todo list.
1. In the network tab, clear all entries.
1. Add a new todo to the list. You should see a POST request in the
   network tab to https://pitangui.amazon.com/api/todos.
1. Right click on this request in the list, and select "Copy as cURL".
1. In a text editor, paste the cURL command from your clipboard, and
   copy the entire `Cookie: ...` header (excluding the "Cookie: "
   text).
1. Open `api/echo/.credentials.json` in your text editor (relative to
   wherever you checked out this repo).
1. Highlight `PasteEchoCookieHere` and paste from your
   clipboard. **This string has quotes in it; make sure to escape them
   before saving the file.**
1. Replace `CsrfValueGoesHere` with the CSRF value from the cookie
   string (should be a large integer).

## Other Credentials

Other credentials are located in `api/nest/.credentials.json` and
`api/hue/.credentials.json`. Your Nest credentials are the same ones
you use to log in to the app, and the username for Hue is explained
above (in "Prerequisites").

## Running the App

This is a Node app, so (after adding the required credentials) running
the app is really just two steps:

1. Run `npm install` to install required packages.
1. Run `node app` to run the app.

## Todo

- actual Amazon login (rather than this cookie hack)
- better credential management overall
- look for a better way of converting "seventy three" to 73
- automatic creation of usernames for Hue (should be trivial, but it
  would be good to add it)
- "global" commands (that don't require a prefix)
- maybe get rid of the whole prefix idea altogether
- "scenes" (tasks that can call subtasks; i.e., set the lights *and*
  temperature)


[wolfram]: https://developer.wolframalpha.com/portal/apisignup.html
[hue-api]: https://github.com/peter-murray/node-hue-api
[youtube]: https://www.youtube.com/watch?v=0I3E-auy8JA
