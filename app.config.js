import "dotenv/config";

export default {
  "expo": {
    "name": "RestaurantApp",
    "slug": "restaurantapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/burger-logo-fondo.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": false,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.supermaty01.restaurantapp",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/burger-logo.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.supermaty01.restaurantapp",
      "versionCode": 1,
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "MANAGE_DOCUMENTS",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/burger-logo.png"
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      [
        "expo-splash-screen",
        {
          "image": "./assets/burger-logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "acb4a328-034e-4fa5-8381-226436faaf98"
      },
      "OFFLINE_MODE": process.env.OFFLINE_MODE || "false"
    }
  }
}
