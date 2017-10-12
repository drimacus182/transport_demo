library(dplyr)
library(lubridate)
library(ggplot2)

data <- read.csv("data/buses_day.csv", colClasses=c('integer', 'character', 'numeric', 'numeric', 'integer', 'character', 'integer', 'numeric'))

data <- data %>% 
  mutate(GPS_DATETIME=GPS_DATETIME %>% as.POSIXct) %>%
  mutate(timestamp=as.integer(GPS_DATETIME)) %>% 
  mutate(minute=round.POSIXt(GPS_DATETIME, 'mins') %>% as.POSIXct) %>% 
  filter(timestamp >= 1470023165 & timestamp <= 1470030000)

grouped <- data %>% 
  mutate(timestamp=as.integer(minute)) %>% 
  group_by(UNIT_NO, timestamp) %>%
  filter(row_number()==1) %>% 
  ungroup()

minutes <- seq(1470023160, 1470030000, 60)



