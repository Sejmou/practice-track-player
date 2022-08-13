from collections import defaultdict
from pytube import YouTube
import os
import re
from pathlib import Path
import json
import argparse
from moviepy.editor import AudioFileClip
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
import multiprocessing
from itertools import repeat


def download_youtube_mp3(data, output_dir):
    base_url = "https://www.youtube.com/watch?v="
    id = data["id"]
    url = f"{base_url}{id}"
    yt = YouTube(url)
    status = yt.vid_info["playabilityStatus"]["status"]
    if status == "UNPLAYABLE":
        print(f"video_id {id} is not playable, cannot download.")
        return

    try:
        isinstance(yt.length, int)
    except:
        print(f"Could not get video length for {id}. Skipping download.")
        return

    filename = data["name"]
    if filename is None:
        filename = re.sub("\W+", " ", yt.title).strip()

    mp4_path = yt.streams.get_audio_only().download(
        filename=filename, output_path=output_dir
    )

    # for some reason, audio is still in mp4 format, convert mp4 to mp3
    base, ext = os.path.splitext(mp4_path)
    mp3_path = base + ".mp3"
    audioclip = AudioFileClip(mp4_path)
    audioclip.write_audiofile(mp3_path)
    audioclip.close()
    os.remove(mp4_path)

    mp3file = MP3(mp3_path, ID3=EasyID3)
    if data["mp3tags"] is not None:
        print(data["mp3tags"])
        for key, value in data["mp3tags"].items():
            mp3file[key] = value
    else:
        mp3file["title"] = yt.title.strip()

    mp3file.save()

    print(f"'{mp3_path}' has been successfully downloaded. Video id: {id}")


def parse_yt_json(json_path):
    download_data = []
    with open(json_path) as f:
        d = json.load(f)
        for i in d["items"]:
            id = i["contentDetails"]["videoId"]
            download_data.append({"id": id})
    return download_data


def parse_musical_practice_track_json(json_path):
    tracks_by_role = defaultdict(list)
    with open(json_path) as f:
        d = json.load(f)
        musical_name = d["title"]
        for song in d["songs"]:
            tracks = song["tracks"]
            song_title = song["title"]
            song_no = song["no"]
            for track in tracks:
                role = track["track"]
                id = track["url"].removeprefix("https://www.youtube.com/watch?v=")
                track_title = f"{song_no}. {song_title}"
                tracks_by_role[role].append(
                    {
                        "id": id,
                        "name": id,
                        "mp3tags": {
                            "title": track_title,
                            "album": f"{musical_name} ({role})",
                        },
                    }
                )
    download_data = []
    for track_list in tracks_by_role.values():
        total_tracks = len(track_list)
        for i, track in enumerate(track_list):
            track_num = i + 1
            track["mp3tags"]["tracknumber"] = f"{track_num}/{total_tracks}"
            download_data.append(track)
    return download_data


def get_track_data(json_folder, musical_tracks=False):
    jsons = os.listdir(json_folder)
    data = []
    for file in jsons:
        file_path = f"{json_folder}/{file}"
        json_data = (
            parse_musical_practice_track_json(file_path)
            if musical_tracks
            else parse_yt_json(json_path=file_path)
        )
        data += json_data

    return data


def download(video_data, output_dir: str):
    pool = multiprocessing.Pool()
    pool.starmap(download_youtube_mp3, zip(video_data, repeat(output_dir)))


def run():
    parser = argparse.ArgumentParser(description="Download MP3 from YouTube")
    parser.add_argument(
        "json_folder",
        type=str,
        help="Path to the folder containing JSON files with YouTube video data that should be parsed",
    )
    parser.add_argument(
        "--out",
        nargs="?",
        default="./out",
        help="The output directory to write the downloaded files to",
    )
    parser.add_argument(
        "--musical-practice",
        action="store_true",
        help="parse the JSON files as musical practice track JSONs (custom format)",
    )

    args = parser.parse_args()
    json_folder = args.json_folder
    output_dir = args.out

    video_data = get_track_data(
        json_folder=json_folder, musical_tracks=args.musical_practice
    )

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    download(video_data, output_dir)


run()
