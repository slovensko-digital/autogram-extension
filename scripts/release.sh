VERSION=$(npx auto version)

## Support for label 'skip-release'
if [ ! -z "$VERSION" ]; then
    npm run clean
    npm run build:prod
    ## Update Changelog
    npx auto changelog

    ## Publish Package
    npm version $VERSION -m "Bump version to: %s [skip ci]"
    npm publish

    ## Create GitHub Release
    git push --follow-tags --set-upstream origin $branch
    npx auto release
fi
