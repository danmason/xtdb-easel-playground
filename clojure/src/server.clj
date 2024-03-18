(ns server
  (:require [clojure.spec.alpha :as s]
            [clojure.tools.logging :as log]
            [muuntaja.core :as m]
            [pages
             [home :as home]
             [draw :as draw]
             [history :as history]]
            [reitit.dev.pretty :as pretty]
            [reitit.ring :as ring]
            [reitit.coercion.spec :as rcs]
            [reitit.ring.coercion :as rrc]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [ring.middleware.params :as params]
            [ring.adapter.jetty :as jetty]
            [xtdb.client :as xtc]
            [xtdb.api :as xt])
  (:import [java.time ZonedDateTime]
           [java.time.format DateTimeFormatter]))

(def node (xtc/start-client "http://localhost:3000"))

(defn save-canvas-info [request]
  (let [{:keys [canvasId image]} (get-in request [:parameters :body])]
    (log/info (format "Saving edits to canvas %s... " canvasId))
    (xt/submit-tx node [[:put-docs :drawings {:xt/id canvasId
                                              :image-state image}]])
    {:status 200
     :body "Canvas Saved!"}))

(defn update-valid-from [m]
  (update m :xt/valid-from (fn [^ZonedDateTime zdt]
                             (.format zdt (DateTimeFormatter/ofPattern "yyyy-MM-dd'T'HH:mm:ss'Z'")))))

(defn fetch-all-canvases []
  (log/info (format "Fetching current state of all canvases"))
  (->> (xt/q node '(from :drawings [xt/id image-state xt/valid-from]))
       (map update-valid-from)))

(defn fetch-latest-canvas [canvas-id]
  (log/info (format "Fetching current state of canvas %s..." canvas-id))
  (some->> (xt/q node '(from :drawings {:bind [{:xt/id $id} image-state xt/valid-from]})
                 {:args {:id canvas-id}})
           (first)
           (update-valid-from)))

(defn fetch-canvas-history [canvas-id]
  (log/info (format "Fetching historical state of canvas %s..." canvas-id))
  (->> (xt/q node '(-> (from :drawings {:bind [{:xt/id $id} image-state xt/id xt/valid-from]
                                        :for-valid-time :all-time})
                       (order-by {:val xt/valid-from, :dir :asc :nulls :last}))
             {:args {:id canvas-id}})
       (map update-valid-from)))

(s/def ::canvasId string?)
(s/def ::draw-query-params (s/keys :opt-un [::canvasId]))

(defn website-router
  []
  (ring/router
   [["/"
     {:get {:summary "Fetch main page" 
            :handler (fn [_request]
                       (let [all-canvas-states (fetch-all-canvases)]
                         {:status 200
                          :body (home/html all-canvas-states)}))}}]
    ["/draw"
     {:get {:summary "Fetch drawing page"
            :parameters {:query ::draw-query-params}
            :handler (fn [request]
                       (let [{:keys [canvasId]} (get-in request [:parameters :query])
                             current-canvas-state (when canvasId
                                                    (fetch-latest-canvas canvasId))]
                         {:status 200
                          :body (draw/html {:canvas-id canvasId
                                            :canvas-state current-canvas-state})}))}}]
    ["/history"
     {:get {:summary "Get all historical info about canvas"
            :parameters {:query {:canvasId string?}}
            :handler (fn [request]
                       (let [{:keys [canvasId]} (get-in request [:parameters :query])
                             canvas-history (fetch-canvas-history canvasId)]
                         {:status 200
                          :body (history/html canvas-history)}))}}]

    ["/save"
     {:post {:summary "Save info about canvas"
             :parameters {:body {:canvasId string?, :image string?}}
             :responses {200 {:body string?}}
             :handler save-canvas-info}}]]
   {:exception pretty/exception
    :data {:coercion rcs/coercion
           :muuntaja m/instance
           :middleware [params/wrap-params
                        muuntaja/format-middleware
                        rrc/coerce-exceptions-middleware
                        rrc/coerce-request-middleware
                        rrc/coerce-response-middleware]}}))

(defn start
  [{:keys [join]}]
  (let [port 8000
        server (jetty/run-jetty (ring/ring-handler
                                 (website-router)
                                 (ring/routes
                                  (ring/create-resource-handler {:path "/assets/"})
                                  (ring/create-default-handler)))
                                {:port port, :join? join})]
    (log/info "server running " "on port " port)
    server))

(comment
  (def server (start {:join false}))

  (.stop server)
  )

