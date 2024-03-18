(ns pages.history
  (:require [cheshire.core :as json]
            [hiccup.core :as hiccup]))

(defn html [image-states] 
  (hiccup/html
   [:html
    [:head
     [:title "History/Timelapse"]
     [:link {:rel "stylesheet" :href "/assets/css/main.css"}]
     [:script (format "var imageStates = %s;" (json/generate-string image-states))]
     [:script {:src "/assets/js/history-timelapse.js"}]]
    [:body
     [:div.title "History/Timelapse"]
     [:canvas.canvas {:id "timelapseCanvas" :width "500" :height "500"}]
     [:div.state-time "State at: --"]
     [:div.controls
      [:div.button {:id "stepBackButton"} "Step Back"]
      [:div.button {:id "restartButton"} "(Re) Start Timelapse"]
      [:div.button {:id "stepForwardButton"} "Step Forward"]]]]))
