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


## Creating New Filters

The whole point of this project is to make it easy to write vanilla Javascript functions to process video frame pixels.

To create a new filter:

1. Create your new filter function in [filters.js](https://github.com/derekenos/gritty-viddy/blob/master/lib/filters.js). I suggest using [invert](https://github.com/derekenos/gritty-viddy/blob/master/lib/filters.js#L139-L144) as a template for a parameterless function, and [brightness](https://github.com/derekenos/gritty-viddy/blob/master/lib/filters.js#L75-L84) for one that takes one or more parameters.

2. Add a [gpu.js](https://github.com/gpujs/gpu.js) wrapper function for your filter in [gpuFilters.js](https://github.com/derekenos/gritty-viddy/blob/master/lib/gpuFilters.js). I also recommend using `invert` and `brightness` as templates here.

3. Add your filter's dropdown label to [constants.FILTER_NAME_DISPLAYNAME_MAP](https://github.com/derekenos/gritty-viddy/blob/master/lib/constants.js#L74)

3. Add your filter's default params to [constants.FILTER_NAME_PARAM_DEFAULT_MAP](https://github.com/derekenos/gritty-viddy/blob/master/lib/constants.js#L92)

4. Add your filter function's positional `params` argument info to [constants.FILTER_NAME_PARAM_KEY_ARR_POS_MAP](https://github.com/derekenos/gritty-viddy/blob/master/lib/constants.js#L113). Within the application, the filter params are represented using an object with human-friendly keys and values, but when it comes time to actually invoke the filter function, for compatibility with `gpu.js`, this params object needs to be converted to an array of numbers and `FILTER_NAME_PARAM_KEY_ARR_POS_MAP` is where you specify the position in the final array for each param.

Note that if your filter function needs to access the original `ImageData` array (passed to the filter function as `data`), for example to read pixels other than its own to implement something like `Horizontal Mirror`, you need to:

- Define your non-GPU filter function in `filters.js`
- Add your filter to the [filters.FRAME_BUFFER_FILTERS](https://github.com/derekenos/gritty-viddy/blob/master/lib/filters.js#L250) array
- Define your GPU filter function in `gpuFilters.js` that includes all of the filter logic / does not invoke `FILTERS.<yourNonGPUFunction>`

Here are some examples of filters that are implemented in this way:

- Flip Horizontal
- Horizontal Mirror
- Vertical Mirror
- Blur
- Pan / Zoom






