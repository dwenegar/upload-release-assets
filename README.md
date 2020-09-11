# GitHub Release Assets Upload Action

```yaml
on:
  push:
    tags:
    - 'v*'

name: Upload Release Assets

jobs:
  build:
    name: Upload Release Assets
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      ...
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
      - name: Upload Release Assets
        id: upload-release-assets
        uses: dwenegar/upload-release-assets@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          release_id: ${{ steps.create_release.outputs.id }}
          path: path/to/my/assets
```
