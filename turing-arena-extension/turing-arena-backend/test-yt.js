(async () => {
  const { YoutubeTranscript } = await import('youtube-transcript');
  try {
    const res = await YoutubeTranscript.fetchTranscript('yUohoaC8_Hs');
    console.log(res.slice(0, 3));
  } catch (e) {
    console.error(e);
  }
})();