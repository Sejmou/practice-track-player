import { extractQueryParamAsString } from '@backend';
import { SourceData } from '@models';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SourceData> // TODO: research on how to type error response
) {
  const fileId = extractQueryParamAsString(req, 'fileId');
  console.log('fetching Google Drive MP3 URL for file ID', fileId);
  try {
    const folderFilesApiRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q="1MLrz6gwYq_G52JdPVzmGa5DCRsVVPJ8h"+in+parents+and+name+contains+"${fileId}"&key=${process.env.YOUTUBE_API_KEY}` // try fetching data about Google Drive folder
    );
    const json = await folderFilesApiRes.json();
    const fileNamesAndIds = (json.files as { name: string; id: string }[]).map(
      f => ({
        name: f.name,
        id: f.id,
      })
    );
    const file = fileNamesAndIds.find(f => f.name.startsWith(fileId));
    if (!file) {
      res.status(404).end();
      return;
    }
    const fileDataRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}?fields=webContentLink%2CmimeType&key=${process.env.YOUTUBE_API_KEY}`
    );

    const fileDataJson = await fileDataRes.json();
    console.log(fileDataJson);
    const fileSrcData: SourceData = {
      src: fileDataJson.webContentLink,
      type: fileDataJson.mimeType,
    };
    res.status(200).json(fileSrcData);
  } catch (error) {
    console.warn('An error occurred while fetching the audio stream', error);
    res.status(404).end();
  }
}
