# Sangwoo Photography

A minimal photography portfolio for GitHub Pages.

## Add photos

1. Open `images/works/featured` on GitHub.
2. Click **Add file → Upload files**.
3. Drag in web-sized JPG, JPEG, PNG, WebP, or AVIF files.
4. Click **Commit changes**. GitHub Pages will rebuild the gallery automatically.

Images are ordered by filename. Use numeric prefixes when the order matters:

```text
001-dawn-arun.jpg
002-express.jpg
003-pride.jpg
```

For good loading performance, resize images to 2000–2500 px on the long edge before uploading. Keep each file around 500 KB–1.5 MB when possible. Do not upload RAW files.

## Add a new project

1. Create a folder under `images/works`, for example `images/works/seoul`.
2. Upload the project photos to that folder.
3. Add the project to `_data/projects.yml`:

```yml
- title: Seoul
  slug: seoul
  year: 2026
```

The `slug` must exactly match the folder name.

## Edit About

Edit the `about` section in `_config.yml`.

## Links

Instagram: [@paintingsbylight](https://www.instagram.com/paintingsbylight/)
