import { View, Text, StatusBar, Image, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { theme } from '../theme'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather'
import { weatherImages } from '../constants'
import * as Progress from 'react-native-progress'
import { getData, storeData } from '../utils/asyncStorage'

const HomeScreen = () => {

  const [showSearch, toogleSearch] = useState(false)
  const [locations, setLocations] = useState([])
  const [weather, setWeather] = useState([])
  const [loading, setLoading] = useState(true)

  const handleLocation = (loc) => {
    console.log('location: ' + loc)
    setLocations([])
    toogleSearch(false)
    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days: 7
    }).then(data => {
      setLoading(false)
      setWeather(data)
      storeData('city', loc.name)
    })
  }

  const handleSearch = value => {
    console.log('search: ', value)
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then(data => {
        setLocations(data)
      })
    }

  }

  useEffect(() => {
    fetchMyWeatherData(9)
  }, [])

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])
  const fetchMyWeatherData = async () => {
    let myCity = await getData('city')
    let cityName='Bilecik'
    if (myCity) cityName = myCity
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data)
      setLoading(false)
    })


  }

  const { current, location } = weather



  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <StatusBar style='light' />
      <Image blurRadius={70} source={require('../assets/images/bg.png')} className="absolute w-full h-full" />
      {
        loading? (
         <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={150} color="#0bb3b2"/>
         </View>
        ):(
          <SafeAreaView className="flex flex-1">
          <View style={{ height: '7%' }} className='mx-4 relative z-50'>
            <View className="flex-row justify-end items-center rounded-full" style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
              {
                showSearch ? (<TextInput
                  onChangeText={handleSearch}
                  placeholder='Search city'
                  placeholderTextColor={'lightgray'}
                  className="pl-6 h-10 flex-1 text-base text-white" />
                ) : null
              }
              <TouchableOpacity onPress={() => toogleSearch(!showSearch)} style={{ backgroundColor: theme.bgWhite(0.3) }} className='rounded-full p-3 m-1'>
                <MagnifyingGlassIcon size='25' color='white' />
              </TouchableOpacity>
  
            </View>
            {
              locations.length > 0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                  {
                    locations.map((loc, index) => {
                      let showBorder = index + 1 != locations.length
                      let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : 'border-b-5 border-b-red'
                      return (
                        <TouchableOpacity onPress={() => handleLocation(loc)} key={index} className={`flex-row items-center border-0 p-3 px-4 mb-1 ${borderClass}`}>
                          <MapPinIcon size="20" color="gray" />
                          <Text className="text-black text-lg ml-2"> {loc?.name}, {loc?.country}</Text>
                        </TouchableOpacity>
                      )
                    })
                  }
                </View>
  
              ) : null
            }
  
          </View>
  
          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white mt-5 text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg font-semibold">
                {"" + location?.country}
              </Text>
            </Text>
            {/* weather image */}
            <View className="flex-row justify-center">
              <Image source={weatherImages[current?.condition?.text]} className="w-52 h-52" />
            </View>
            {/* degree celcius */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-2xl ml-5 tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/wind.png')} className="w-6 h-6" />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/drop.png')} className="w-6 h-6" />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/sun.png')} className="w-6 h-6" />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          {/* next days */}
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size='22' color='white' />
              <Text className="text-white text-base">  Daily forecast </Text>
            </View>
            <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 15 }} showsHorizontalScrollIndicator={false}>
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date)
                let options = { weekday: 'long' }
                let dayName = date.toLocaleDateString('en-US', options)
                return (
                  <View key={index} style={{ backgroundColor: theme.bgWhite(0.15) }} className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4">
                    <Image source={weatherImages[item?.day?.condition?.text]} className="w-11 h-11" />
                    <Text className="text-white text-base"> {dayName} </Text>
                    <Text className="text-white text-xl font-semibold"> {item.day?.avgtemp_c}&#176; </Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
        )
      }
    
    </View>
  )
}

export default HomeScreen