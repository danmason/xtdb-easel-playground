(ns pages.main
  (:require [hiccup.core :as hiccup]))

(defn generate-canvas-id []
  (format "canvas_%s" (subs (str (random-uuid)) 0 8)))

(defn html 
  [{:keys [canvas-id canvas-state]}]
  (let [canvas-id-var (or canvas-id (generate-canvas-id))
        image-state (:image-state canvas-state)
        last-edited (:xt/valid-from canvas-state)] 
    (hiccup/html
     [:html
      [:head
       [:title "Draw!"]
       [:link {:rel "stylesheet" :href "/assets/css/main.css"}]
       [:script (format "var canvasId = '%s';" canvas-id-var)]
       [:script (format "var imageState = '%s';" image-state)]
       [:script {:src "/assets/js/drawing.js"}]]
      [:body
       [:div.title "Draw!"]
       [:div.subtitle "We'll save your history."]
       [:canvas.canvas {:id "drawingCanvas" :width "500" :height "500"}]
       [:div.last-edited (format "Last Edited: %s" (if last-edited
                                                     last-edited
                                                     "Not yet saved"))]
       [:a.button {:href (str "/history?canvasId=" canvas-id-var)} "History/Timelapse"]]])))
