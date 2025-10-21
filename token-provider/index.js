const express = require('express');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/datastore'] // Firestore REST uses Datastore scope
});

app.get('/token', async (req, res) => {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = accessToken && accessToken.token ? accessToken.token : accessToken;
    res.json({ token });
  } catch (err) {
    console.error('Error getting access token:', err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Token provider listening on ${port}`));
