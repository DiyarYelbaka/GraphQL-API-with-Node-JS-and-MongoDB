import { View, Text,TouchableOpacity,StyleSheet } from 'react-native'
import React,{useEffect} from 'react'
import PushNotification from "react-native-push-notification";

const App = () => {
  useEffect(()=>{
   createChannels()
  },)

  const createChannels = () =>{
    PushNotification.createChannel({
      channelId:"test-channel",
      channelName:"test channel"
    })
  }

  const handleNotification = () =>{
    PushNotification.cancelAllLocalNotifications()

    PushNotification.localNotification({
       channelId:"test-channel",
       title:"Bildirim Deneme",
       message:'Yeni Haber'
    })

    PushNotification.localNotificationSchedule({
      channelId:"test-channel",
      title:"Alarm",
      message:'Yeni Haber',
      date: new Date(Date.now() + 10 * 1000),
      allowWhileIdle: true,
   })
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={()=> {handleNotification()}}
      >
        <Text>Press Here</Text>
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10
  },
 
});

export default App