(ns pages.home
  (:require [hiccup.core :as hiccup]))

(defn html
  [canvas-states]
  (hiccup/html
   [:html
    [:head
     [:title "Easel Playground"]
     [:link {:rel "stylesheet" :href "/assets/css/main.css"}]]
    [:body.block
     [:div.container
      [:h1.title "Easel Playground"]
      [:a.button {:href "/draw" :target "_blank"} "Create a new easel!"]
      [:h2 "Saved Easels"]
      [:div.grid
       (for [{:keys [xt/id image-state]} canvas-states]
         [:div.canvas-preview
          [:img {:src image-state :alt "Canvas Preview"}]
          [:div.canvas-id (str "Canvas ID: " id)]
          [:div.links
           [:a {:href (str "/draw?canvasId=" id) :target "_blank"} "Edit"]
           " | "
           [:a {:href (str "/history?canvasId=" id) :target "_blank"} "View History"]]])]]]]))