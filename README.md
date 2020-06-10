# Gritty Viddy

Realish-time in-browser video effects using vanilla Javascript.

### [Try it here](https://s3.amazonaws.com/derekenos.com/projects/gritty-viddy/index.html)!

![Screenshot from 2020-06-10 11-29-23](https://user-images.githubusercontent.com/585182/84287396-da15ae80-ab0d-11ea-9786-4d5c0770ebad.png)

![Screenshot from 2020-06-10 11-50-53](https://user-images.githubusercontent.com/585182/84289700-cf104d80-ab10-11ea-9d44-4b9bfd5c5f29.png)

![Screenshot from 2020-06-10 11-53-22](https://user-images.githubusercontent.com/585182/84289942-15fe4300-ab11-11ea-8d0d-ae8af1b23027.png)


## Install the Development Dependencies

You'll need `node` (v13.8.9 or compatible) and `npm` (v6.13.6 or compatible) installed.

I recommend using [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) to install/manage your node versions.

```
npm install
```


## Start the Development Server

```
npm run dev
```

## Build a Standalone `index.html`

```
npm run build
```

You'll find the result at: `build/dist/index.html`


## Editing Filter Parameters

Each filter parameter textarea input supports arbitrary Javascript expressions and is [`eval()`'d to produce a `number`](https://github.com/derekenos/gritty-viddy/blob/master/components/ImageProcessor.js#L48-L64) before passing the value to the underlying filter function. If the expression does not produce a `number`, the video stream will pause until you give it what it wants.

This means that you have the entire browser Javascript API at your disposal, allowing you to specify dynamic values like `Date.now()` and `Math.random()` in your filter params.

The following application-specific variables (created by [getAudioParams()](https://github.com/derekenos/gritty-viddy/blob/master/lib/audio.js#L34-L58)) are also supported in the filter params:

- `loudness` - The loudness of the audio in the range `0.0 - 1.0`
- `samples` - The array of 8-bit audio samples for the current frame (not really useful for most filters but is implicitly [used as the sole argument to the Audio Plot filter](https://github.com/derekenos/gritty-viddy/blob/master/components/ImageProcessor.js#L180-L181))




