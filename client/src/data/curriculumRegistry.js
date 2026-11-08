import { NICOS_WEG_PLAYLIST, NICOS_WEG_EPISODES_MAP } from './nicosWegPlaylist.js';
import { EASY_GERMAN_PLAYLIST, EASY_GERMAN_EPISODES_MAP } from './easyGermanPlaylist.js';

export { NICOS_WEG_PLAYLIST, NICOS_WEG_EPISODES_MAP };
export { EASY_GERMAN_PLAYLIST, EASY_GERMAN_EPISODES_MAP };

export const ALL_CURRICULA = {
  nicos_weg: {
    id: 'nicos_weg',
    title: 'Nicos Weg (DW)',
    author: 'DW Deutsch lernen',
    level: 'A1',
    playlistId: NICOS_WEG_PLAYLIST.playlistId,
    playlist: NICOS_WEG_PLAYLIST,
    episodesMap: NICOS_WEG_EPISODES_MAP
  },
  easy_german: {
    id: 'easy_german',
    title: 'Easy German A1',
    author: 'Easy German',
    level: 'A1',
    playlistId: EASY_GERMAN_PLAYLIST.playlistId,
    playlist: EASY_GERMAN_PLAYLIST,
    episodesMap: EASY_GERMAN_EPISODES_MAP
  }
};

export const ALL_EPISODES_MAP = {
  ...NICOS_WEG_EPISODES_MAP,
  ...EASY_GERMAN_EPISODES_MAP
};

export function getEpisodeByVideoId(videoId) {
  if (!videoId) return null;
  return ALL_EPISODES_MAP[videoId] || null;
}

export function getCurriculumByVideoId(videoId) {
  if (!videoId) return null;
  if (EASY_GERMAN_EPISODES_MAP[videoId]) return ALL_CURRICULA.easy_german;
  if (NICOS_WEG_EPISODES_MAP[videoId]) return ALL_CURRICULA.nicos_weg;
  return null;
}
