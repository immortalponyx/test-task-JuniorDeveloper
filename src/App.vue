<template lang="pug">
  #app
    yandex-map(:coords="coords" :zoom="9" @click="onClick" @map-was-initialized="mapInit")
     ymap-marker(:coords="coords" marker-id="123"  :properties="properties" )
     ymap-marker(:marker-id="1"
          marker-type="polygon"
          :coords="[polygon,[]]"
          circle-radius="16000"
          :marker-fill="{color: '#1890ff', opacity: 0.9}"
          :marker-stroke="{color: '#1890ff', width: 1}"
          :balloon="{header: 'MSC', body: 'MSC', footer: 'MSC'}")
</template>

<script>
import { loadYmap } from 'vue-yandex-maps'
import mkadArray from './store/modules/MKAD.js'
import { sortBy } from 'lodash'
export default {

  data: () => ({
    coords: [
      55.76,
      37.64
    ],
    properties: {
    },
    polygon: mkadArray.map((i) => i.reverse()),
    ySettings: {}
  }),
  methods: {
    async onClick (e) {
      this.coords = e.get('coords')
      this.getAddress(this.coords)
      const closestDistance = await this.getClosestDistance(this.coords)
      this.setRoute(e, closestDistance)
    },
    getAddress (coords) {
      this.properties.iconCaption = 'поиск...'
      // eslint-disable-next-line no-undef
      ymaps.geocode(coords).then(res => {
        var firstGeoObject = res.geoObjects.get(0)

        this.properties = {
          // Формируем строку с данными об объекте.
          iconCaption: [
            // Название населенного пункта или вышестоящее административно-территориальное образование.
            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
          ].join(', '),
          // В качестве контента балуна задаем строку с адресом объекта.
          balloonContent: firstGeoObject.getAddressLine()
        }
      })
    },
    mapInit (map) {
      this.mscMap = map
    },
    getClosestDistance (currentPoint) {
      const object = []
      this.polygon.forEach((coords) => {
        const r = 6371 // Радиус земли
        const dLat = (currentPoint[0].toFixed(6) - coords[0]) * (Math.PI / 180)
        const dLon = (currentPoint[1].toFixed(6) - coords[1]) * (Math.PI / 180)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coords[0] * (Math.PI / 180)) * Math.cos(currentPoint[0] * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = r * c
        object.push({ distance, coords })
      })
      return object
    },
    setRoute (e, closestDistance) {
      const selectPoint = sortBy(closestDistance, 'distance')[0]
      // eslint-disable-next-line no-undef
      ymaps.route([e.get('coords'), selectPoint.coords]).then((router) => {
        const distance = router.getLength()
        console.log(distance)
        console.log('info', this.route)
        console.log(this.mscMap)
        if (this.route) this.mscMap.geoObjects.remove(this.route)
        this.route = router.getPaths()
        this.route.options.set({ strokeWidth: 5, strokeColor: '227f05', opacity: 0.7 })
        this.mscMap.geoObjects.add(this.route)
      }, (error) => {
        console.log(error)
      })
    }
  },
  mounted: {
    async mounted () {
      await loadYmap()
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
#app {
  display: grid;
  grid-template-rows: 1fr;
  min-height: 100vh;
}
</style>
