const fs = require('fs/promises');
const path = require('path');

module.exports = async function (context, req) {
  const filePath = path.join(context.executionContext.functionDirectory, 'hello-output.txt');

  try {
    await fs.writeFile(filePath, 'hey, I worked!', 'utf8');

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        ok: true,
        message: 'The hello world function created hello-output.txt.'
      }
    };
  } catch (error) {
    context.log.error('Failed to create hello output file', error);

    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        ok: false,
        error: 'Unable to create hello output file.'
      }
    };
  }
};
