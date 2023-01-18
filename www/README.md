# Website for dotters.network

- hosted on https://dotsama-ibp.metaspan.io

## get the code
```
git clone https://github.com/dotsama-ibp/dotsama-ibp
```
## Project setup
```
cd dotsama-ibp/www
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
The result can be found in the ./dist folder. We serve this folder in deployment (below).

## Deploy / hosting

After building the project, it's ready to host via webserver like apache.

```conf
<VirtualHost *:80>
    ServerName dotsama-ibp.metaspan.io
    DocumentRoot /var/www/vhosts/metaspan.io/dotsama-ibp/www/dist
    RedirectMatch 301 ^(?!/\.well-known/acme-challenge/).* https://dotsama-ibp.metaspan.io$0
    <Directory /var/www/vhosts/metaspan.io/dotsama-ibp/www/dist>
        AllowOverride All
    </Directory>
</VirtualHost>
<VirtualHost _default_:443>
    ServerName dotsama-ibp.metaspan.io
    DocumentRoot /var/www/vhosts/metaspan.io/dotsama-ibp/www/dist
    # forward all urls to index.html
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/dotsama-ibp.metaspan.io/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/dotsama-ibp.metaspan.io/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/dotsama-ibp.metaspan.io/chain.pem
    <FilesMatch "\.(cgi|shtml|phtml|php)$">
        SSLOptions +StdEnvVars
    </FilesMatch>
    <Directory /usr/lib/cgi-bin>
        SSLOptions +StdEnvVars
    </Directory>
     <Directory /var/www/vhosts/metaspan.io/dotsama-ibp/www/dist>
        AllowOverride All
    </Directory>
</VirtualHost>
```

# Refs
- made with vue.js and vuetify.js
