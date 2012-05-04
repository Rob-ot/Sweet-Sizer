# Sweet Sizer

```javascript
  app.use("/uploads", // the route to resize images from
    sweetSizer({
      allowLocal: true, // allow images on the server to be resized e.g. http://yourdomain.com/img/myimage.png/200 (default: true)

      dir: __dirname + "/public/uploads", // the local location of images (default: __dirname)

      allowRemote: true, // Allow remote urls to be requested e.g. http://yourdomain.com/img/http://imagesite.com/image.png/200 (default: false)

      verbose: true, // dump more stuff to the console (default: false)

      cacheDir: "", // specify a place to cache the resized images (default: the value of 'dir', so cached images will be stored in the same place as local images)

      configureParams: fn(currentParams), // configure params before images are resized, this is sent directly to https://github.com/rsms/node-imagemagick to the resize function. Needs to return munged params (default: fn that just returns params)

      cacheName: fn(data, url, opts), // create a filename to check for and save resized images as (default: newImageWidth-escapedFilename)

      resolveToLocal: fn(data, url, opts) // take a given path and return a local url (default: opts.dir + fileUrl)
    })
  )
```