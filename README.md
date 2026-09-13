# Numica public site

Static support and privacy pages for Numica, published with GitHub Pages at
<https://numica.dvi9.ca/>.

The site intentionally has no build step, scripts, forms, analytics, cookies,
or external assets. GitHub Pages publishes the `main` branch from the repository
root. The custom domain is declared in `CNAME`.

DNS must contain this record after the Pages custom domain is configured:

```text
Type:  CNAME
Name:  numica
Value: sheraysingh.github.io
```

Run the checks with `node --test test/site.test.mjs`.
