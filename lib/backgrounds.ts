
export interface BackgroundResource {
  id: string;
  thumbnail: string;
  url: string;
  type: 'image' | 'video';
}

export const imageBackgrounds: BackgroundResource[] = [
  {
    id: 'img1',
    thumbnail: 'https://images.pexels.com/photos/2895295/pexels-photo-2895295.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    url: 'https://images.pexels.com/photos/2895295/pexels-photo-2895295.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&dpr=1',
    type: 'image',
  },
  {
    id: 'img2',
    thumbnail: 'https://images.pexels.com/photos/5997327/pexels-photo-5997327.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    url: 'https://images.pexels.com/photos/5997327/pexels-photo-5997327.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&dpr=1',
    type: 'image',
  },
  {
    id: 'img3',
    thumbnail: 'https://images.pexels.com/photos/7361834/pexels-photo-7361834.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    url: 'https://images.pexels.com/photos/7361834/pexels-photo-7361834.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&dpr=1',
    type: 'image',
  },
  {
    id: 'img4',
    thumbnail: 'https://images.pexels.com/photos/7241415/pexels-photo-7241415.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    url: 'https://images.pexels.com/photos/7241415/pexels-photo-7241415.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&dpr=1',
    type: 'image',
  },
  {
    id: 'img5',
    thumbnail: 'https://images.pexels.com/photos/5325893/pexels-photo-5325893.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    url: 'https://images.pexels.com/photos/5325893/pexels-photo-5325893.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&dpr=1',
    type: 'image',
  },
  {
    id: 'img6',
    thumbnail: 'https://images.pexels.com/photos/8169429/pexels-photo-8169429.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
    url: 'https://images.pexels.com/photos/8169429/pexels-photo-8169429.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&dpr=1',
    type: 'image',
  },
];

export const videoBackgrounds: BackgroundResource[] = [
  {
    id: 'vid1',
    thumbnail: 'https://oliltjdegsuvlmblpvlp.supabase.co/storage/v1/object/public/uploads//18611159-hd_1080_1920_30fps.mp4',
    url: 'https://oliltjdegsuvlmblpvlp.supabase.co/storage/v1/object/public/uploads//18611159-hd_1080_1920_30fps.mp4',
    type: 'video',
  },
  {
    id: 'vid2',
    thumbnail: 'https://player.vimeo.com/progressive_redirect/playback/918738356/rendition/360p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=8753232822506b3a936c56780c1097262176b6d480826955a0b776a30c33a948',
    url: 'https://player.vimeo.com/progressive_redirect/playback/918738356/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=4bd3a24683526543b5e40e28f3521d4c67ec347108969966b5735f1155998782',
    type: 'video',
  },
  {
    id: 'vid3',
    thumbnail: 'https://player.vimeo.com/progressive_redirect/playback/918738275/rendition/360p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=13038defc4293c6f8f5539d91f83e580a82776c8c4a961f185d5a9c0897b7b13',
    url: 'https://player.vimeo.com/progressive_redirect/playback/918738275/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=4e18d184090b835e985b8801c4a3013b94689c51a7e6b7201c1303c1e2858b9f',
    type: 'video',
  },
  {
    id: 'vid4',
    thumbnail: 'https://player.vimeo.com/progressive_redirect/playback/918738259/rendition/360p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=d027b2ce8f36a581452427a9a16f9f06124508933b5c65c276189ac35c5c830c',
    url: 'https://player.vimeo.com/progressive_redirect/playback/918738259/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=a59d9cbe665c192b490f2382e4e1ca4f8c2e9b0b975e11e033285c52c6f37640',
    type: 'video',
  },
  {
    id: 'vid5',
    thumbnail: 'https://player.vimeo.com/progressive_redirect/playback/907936652/rendition/360p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=271542f9b884b8593a8d951834a810d1964f434771f8b1b869671d49265e0108',
    url: 'https://player.vimeo.com/progressive_redirect/playback/907936652/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=7562f74235284b39c943171804c861214e1a067a9998059048a28796593b4556',
    type: 'video',
  },
  {
    id: 'vid6',
    thumbnail: 'https://player.vimeo.com/progressive_redirect/playback/918738241/rendition/360p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=9c66e2c90c746781432c695b45f5c3527b102143003b57f20224e754e150f836',
    url: 'https://player.vimeo.com/progressive_redirect/playback/918738241/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1748226074&signature=f44458f3801844b2f23438a164b4c737c35f29d7d4554b4f0b246a3666b26284',
    type: 'video',
  },
];
