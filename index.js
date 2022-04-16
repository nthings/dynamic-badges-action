const core = require('@actions/core');
const http = require('https');

try {

  // This object will be stringified and uploaded to the gist. The
  // schemaVersion, label and message attributes are always required. All others
  // are optional and added to the content object only if they are given to the
  // action.
  let content = {
    schemaVersion: 1,
    label: core.getInput('label'),
    message: core.getInput('message')
  };

  // Get all optional attributes and add them to the content object if given.
  const labelColor   = core.getInput('labelColor');
  const color        = core.getInput('color');
  const isError      = core.getInput('isError');
  const namedLogo    = core.getInput('namedLogo');
  const logoSvg      = core.getInput('logoSvg');
  const logoColor    = core.getInput('logoColor');
  const logoWidth    = core.getInput('logoWidth');
  const logoPosition = core.getInput('logoPosition');
  const style        = core.getInput('style');
  const cacheSeconds = core.getInput('cacheSeconds');
  const valColorRange = core.getInput('valColorRange');
  const minColorRange = core.getInput('minColorRange');
  const maxColorRange = core.getInput('maxColorRange');
  const invertColorRange = core.getInput('invertColorRange');

  if (labelColor != '') {
    content.labelColor = labelColor;
  }

  if (minColorRange != '' && maxColorRange != '' && valColorRange != '') {
    const max = parseFloat(maxColorRange);
    const min = parseFloat(minColorRange);
    const val = parseFloat(valColorRange);
    if (val < min) val = min;
    if (val > max) val = max;
    let hue = 0
    if (invertColorRange == '') {
      hue = Math.floor((val - min) / (max - min) * 100);
      content.message = val + " / " + max + " " + content.message
    } else {
      hue = Math.floor((max - val) / (max - min) * 100);
      content.message = valColorRange + " " + content.message
    }
    content.color = "hsl(" + hue + ", 100%, 50%)";
  } else if (color != '') {
    content.color = color;
  }

  if (isError != '') {
    content.isError = isError;
  }

  if (namedLogo != '') {
    content.namedLogo = namedLogo;
  }

  if (logoSvg != '') {
    content.logoSvg = logoSvg;
  }

  if (logoColor != '') {
    content.logoColor = logoColor;
  }

  if (logoWidth != '') {
    content.logoWidth = parseInt(logoWidth);
  }

  if (logoPosition != '') {
    content.logoPosition = logoPosition;
  }

  if (style != '') {
    content.style = style;
  }

  if (cacheSeconds != '') {
    content.cacheSeconds = parseInt(cacheSeconds);
  }

  // For the POST request, the above content is set as file contents for the
  // given filename.
  const request = JSON.stringify({
    files: {[core.getInput('filename')]: {content: JSON.stringify(content)}}
  });

  // Perform the actual request. The user agent is required as defined in
  // https://developer.github.com/v3/#user-agent-required
  const req = http.request(
      {
        host: 'api.github.com',
        path: '/gists/' + core.getInput('gistID'),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': request.length,
          'User-Agent': 'Schneegans',
          'Authorization': 'token ' + core.getInput('auth'),
        }
      },
      res => {
        if (res.statusCode < 200 || res.statusCode >= 400) {
          core.setFailed(
              'Failed to create gist, response status code: ' + res.statusCode +
              ', status message: ' + res.statusMessage);
        } else {
          console.log('Success!');
        }
      });

  req.write(request);
  req.end();

} catch (error) {
  core.setFailed(error);
}
