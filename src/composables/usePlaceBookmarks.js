import { ref } from 'vue'
import { getPlaceById } from './usePlaces'

const STORAGE_KEY = 'localhub_bookmarked_places'

function loadList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// [{ category: 'tour', id: '2679008' }, ...]
const bookmarkedPlaces = ref(loadList())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkedPlaces.value))
}

export function usePlaceBookmarks() {
  function isBookmarked(category, id) {
    return bookmarkedPlaces.value.some(
      (p) => p.category === category && String(p.id) === String(id)
    )
  }

  function toggleBookmark(category, id) {
    if (isBookmarked(category, id)) {
      bookmarkedPlaces.value = bookmarkedPlaces.value.filter(
        (p) => !(p.category === category && String(p.id) === String(id))
      )
    } else {
      bookmarkedPlaces.value = [...bookmarkedPlaces.value, { category, id: String(id) }]
    }
    persist()
  }

  function getBookmarkedPlaces() {
    return bookmarkedPlaces.value
      .map((entry) => {
        const place = getPlaceById(entry.category, entry.id)
        return place ? { ...place, category: entry.category } : null
      })
      .filter(Boolean)
  }

  return { bookmarkedPlaces, isBookmarked, toggleBookmark, getBookmarkedPlaces }
}