library(dplyr)
library(lubridate)

data <- read.csv("data/buses_day.csv", colClasses=c('integer', 'character', 'numeric', 'numeric', 'integer', 'character', 'integer', 'numeric'))

data <- data %>% mutate(GPS_DATETIME=GPS_DATETIME %>% as.POSIXct)
