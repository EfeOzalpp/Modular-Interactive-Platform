import { useEffect, useState } from 'react';
import client from '../../utils/sanity';
import MediaLoader from '../../utils/media-providers/media-loader';
import PannableViewport from '../../utils/split+drag/pannable-object-position';
import { useTooltipInit } from '../../utils/tooltip/tooltipInit';
import { useSsrData } from '../../utils/context-providers/ssr-data-context';
import { getHighQualityImageUrl } from '../../utils/media-providers/image-builder';
import '../../styles/block-type-1.css';

type VideoSet = { webmUrl?: string; mp4Url?: string; poster?: any };
type MediaSlot = { alt?: string; image?: any; video?: VideoSet };
type ClimateBookData = { mediaOne: MediaSlot };

export default function ClimateBookBlock() {
  const ssrData = useSsrData();
  const [data, setData] = useState<ClimateBookData | null>(
    (ssrData?.preloaded?.climateBook as ClimateBookData) || null
  );

  useTooltipInit();

  useEffect(() => {
    if (data) return;

    client
      .fetch<ClimateBookData>(
        `*[_type == "mediaBlock" && slug.current == $slug][0]{
          mediaOne{
            alt,
            image,
            video{
              "webmUrl": webm.asset->url,
              "mp4Url": mp4.asset->url,
              poster
            }
          }
        }`,
        { slug: 'climate-book' }
      )
      .then(setData)
      .catch((err) => {
        console.warn('[ClimateBookBlock] GROQ fetch failed:', err);
        setData(null);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data?.mediaOne) return null;

  const { alt = 'Climate Book', image, video } = data.mediaOne;
  const isVideo = Boolean(video?.webmUrl || video?.mp4Url);

  const highPoster = video?.poster
    ? getHighQualityImageUrl(video.poster, 1920, 1080, 90)
    : undefined;

  return (
    <section
      className="block-type-1"
      style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}
    >
      <div
        className="media-content"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
      >
        <PannableViewport sensitivity={2}>
          <MediaLoader
            type={isVideo ? 'video' : 'image'}
            src={isVideo ? (video as VideoSet) : image}
            alt={alt}
            id={isVideo ? 'climate-book-media-video' : 'climate-book-media'}
            {...(highPoster ? { 'data-src-full': highPoster } : {})}
            className="tooltip-climate-book"
            objectPosition="center center"
            style={{ width: '100%', height: '100%' }}
            // priority // uncomment if this is the hero
          />
        </PannableViewport>
      </div>
    </section>
  );
}
