import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { apps, events, permissionIcons, AppInfo } from "./src/data";

const C = {
  bg: "#F5F6F2",
  paper: "#FFFFFF",
  ink: "#20271F",
  muted: "#7B8177",
  line: "#E8EBE3",
  lime: "#D4F578",
  green: "#507038",
  pale: "#EDF3E6",
  orange: "#AD7740",
};
type Tab = "Обзор" | "Приложения" | "Активность" | "Настройки";
const nav: { name: Tab; icon: string }[] = [
  { name: "Обзор", icon: "grid" },
  { name: "Приложения", icon: "layers" },
  { name: "Активность", icon: "activity" },
  { name: "Настройки", icon: "sliders" },
];
function Icon({
  name,
  size = 20,
  color = C.ink,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <Feather
      name={name as React.ComponentProps<typeof Feather>["name"]}
      size={size}
      color={color}
    />
  );
}
function Button({
  label,
  onPress,
  icon = "arrow-up-right",
}: {
  label: string;
  onPress: () => void;
  icon?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.button, pressed && { opacity: 0.7 }]}
    >
      <Text style={s.buttonText}>{label}</Text>
      <Icon name={icon} size={17} color="white" />
    </Pressable>
  );
}
function AppIcon({ app }: { app: AppInfo }) {
  return (
    <View style={[s.appIcon, { backgroundColor: app.bg }]}>
      <Icon name={app.icon} color={app.color} size={21} />
    </View>
  );
}
function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={s.inline}
        >
          <Text style={s.link}>{action}</Text>
          <Icon name="arrow-right" size={15} />
        </Pressable>
      )}
    </View>
  );
}
function Badge({ text, warm = false }: { text: string; warm?: boolean }) {
  return (
    <View style={[s.badge, warm && { backgroundColor: "#FAF0E3" }]}>
      <View style={[s.dot, { backgroundColor: warm ? C.orange : C.green }]} />
      <Text style={[s.badgeText, warm && { color: C.orange }]}>{text}</Text>
    </View>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Veil />
    </SafeAreaProvider>
  );
}
function Veil() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000,
    roomy = width >= 700;
  const params = useLocalSearchParams<{ section?: string }>();
  const tab: Tab = nav.find((n) => n.name === params.section)?.name ?? "Обзор";
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Все");
  const [selected, setSelected] = useState<AppInfo | null>(null),
    [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [protection, setProtection] = useState(true),
    [notifications, setNotifications] = useState(true),
    [biometric, setBiometric] = useState(false);
  const [scanning, setScanning] = useState(false),
    [scanned, setScanned] = useState(false),
    [notice, setNotice] = useState(""),
    [info, setInfo] = useState(false);
  const notify = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3500);
  };
  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      notify("Демонстрационная проверка завершена. Отчёт обновлён.");
    }, 1800);
  };
  const score = scanned ? 92 : 86;
  const visibleApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "Все" ||
        (filter === "С риском"
          ? a.risk
          : a.permissions.some((p) => p === filter))),
  );
  const go = (t: Tab) => {
    router.setParams({ section: t });
    setFilter("Все");
  };
  const close = () => {
    setSelected(null);
    setInfo(false);
  };
  const eventRow = (e: (typeof events)[number], i: number) => (
    <View key={i} style={s.eventRow}>
      <View
        style={[
          s.eventIcon,
          { backgroundColor: e.blocked ? "#F7EFE3" : C.pale },
        ]}
      >
        <Icon
          name={permissionIcons[e.permission]}
          size={17}
          color={e.blocked ? C.orange : C.green}
        />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.rowTitle}>{e.app.name}</Text>
        <Text style={s.small}>
          {e.permission} · {e.description}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 5 }}>
        <Text style={s.time}>{e.time}</Text>
        <Text style={[s.small, { color: e.blocked ? C.orange : C.green }]}>
          {e.blocked ? "Ограничено" : "Разрешено"}
        </Text>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={s.shell}>
        {desktop && (
          <View style={s.sidebar}>
            <View style={s.brand}>
              <View style={s.brandIcon}>
                <Icon name="shield" size={23} color={C.lime} />
              </View>
              <Text style={s.wordmark}>
                veil<Text style={{ color: "#95AA7B" }}>.</Text>
              </Text>
            </View>
            <Text style={s.sideCaption}>ВАША ПРИВАТНОСТЬ</Text>
            <View style={{ gap: 8 }}>
              {nav.map((n) => (
                <Pressable
                  key={n.name}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === n.name }}
                  onPress={() => go(n.name)}
                  style={[s.navItem, tab === n.name && s.navActive]}
                >
                  <Icon
                    name={n.icon}
                    color={tab === n.name ? C.ink : C.muted}
                  />
                  <Text style={[s.navText, tab === n.name && { color: C.ink }]}>
                    {n.name}
                  </Text>
                  {tab === n.name && <View style={s.navDot} />}
                </Pressable>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <View style={s.sideCard}>
              <Icon name="lock" size={21} color={C.green} />
              <Text style={s.sideCardTitle}>Личное остаётся личным</Text>
              <Text style={s.sideCardCopy}>
                Больше прозрачности.{"\n"}Больше контроля.
              </Text>
            </View>
            <Pressable onPress={() => setInfo(true)} style={s.device}>
              <View style={s.deviceIcon}>
                <Icon name="smartphone" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Моё устройство</Text>
                <Text style={[s.small, { marginTop: 4 }]}>Демо-профиль</Text>
              </View>
              <Icon name="chevron-down" size={15} />
            </Pressable>
          </View>
        )}
        <View style={s.main}>
          <View style={[s.topbar, !desktop && { paddingHorizontal: 22 }]}>
            {desktop ? (
              <View style={s.inline}>
                <Text style={s.small}>Моё пространство</Text>
                <Icon name="chevron-right" size={13} color={C.muted} />
                <Text style={s.crumb}>{tab}</Text>
              </View>
            ) : (
              <View style={s.inline}>
                <Icon name="shield" size={24} />
                <Text style={[s.wordmark, { fontSize: 27 }]}>veil.</Text>
              </View>
            )}
            <View style={s.inline}>
              <View style={s.demo}>
                <Text style={s.demoText}>ДЕМО</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="О проекте"
                onPress={() => setInfo(true)}
                style={s.circleButton}
              >
                <Icon name="info" size={18} />
              </Pressable>
            </View>
          </View>
          <ScrollView
            key={tab}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              s.content,
              !roomy && { padding: 22, paddingBottom: 30 },
            ]}
          >
            <View style={s.pageHeading}>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>
                  {tab === "Обзор"
                    ? "ЦИФРОВОЕ СПОКОЙСТВИЕ"
                    : "ВАШЕ УСТРОЙСТВО ПОД КОНТРОЛЕМ"}
                </Text>
                <Text style={[s.h1, !roomy && { fontSize: 31 }]}>
                  {tab === "Обзор"
                    ? "Ваша приватность."
                    : tab === "Приложения"
                      ? "Доступ под контролем."
                      : tab === "Активность"
                        ? "Ничего скрытого."
                        : "На ваших условиях."}
                </Text>
                <Text style={s.subtitle}>
                  {tab === "Обзор"
                    ? "Всё важное о защите устройства в одном месте."
                    : tab === "Приложения"
                      ? "Вы решаете, чем делиться с приложениями."
                      : tab === "Активность"
                        ? "История обращений к данным и датчикам."
                        : "Настройте своё пространство приватности."}
                </Text>
              </View>
              {roomy && tab === "Обзор" && (
                <View style={s.inline}>
                  <View style={[s.dot, { backgroundColor: C.green }]} />
                  <Text style={s.small}>
                    {scanned ? "Только что обновлено" : "Обновлено в 12:45"}
                  </Text>
                </View>
              )}
            </View>
            {tab === "Обзор" && (
              <>
                <View
                  style={[s.heroRow, !roomy && { flexDirection: "column" }]}
                >
                  <View style={[s.hero, { flex: roomy ? 1.65 : undefined }]}>
                    <View style={s.heroTop}>
                      <View style={s.inline}>
                        <Icon name="shield" color={C.lime} size={18} />
                        <Text style={s.heroEyebrow}>ИНДЕКС ПРИВАТНОСТИ</Text>
                      </View>
                      <Icon name="arrow-up-right" color="#A8B59C" size={20} />
                    </View>
                    <View style={[s.heroBody, !roomy && { gap: 15 }]}>
                      <View style={s.gauge}>
                        <Svg width={154} height={154} viewBox="0 0 160 160">
                          <Circle
                            cx="80"
                            cy="80"
                            r="68"
                            stroke="#46513F"
                            strokeWidth="7"
                            fill="none"
                          />
                          <Circle
                            cx="80"
                            cy="80"
                            r="68"
                            stroke={C.lime}
                            strokeWidth="7"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={[(427.26 * score) / 100, 427.26]}
                            transform="rotate(-90 80 80)"
                          />
                        </Svg>
                        <View style={s.gaugeText}>
                          <Text style={s.score}>{score}</Text>
                          <Text style={s.scoreLabel}>из 100</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, gap: 10 }}>
                        <Text style={[s.heroTitle, !roomy && { fontSize: 24 }]}>
                          Хорошая{"\n"}защита
                        </Text>
                        <Text style={s.heroCopy}>
                          {scanned
                            ? "Проверка завершена. Вы управляете своими данными."
                            : "Есть несколько настроек, которые стоит проверить."}
                        </Text>
                        <View style={s.heroPill}>
                          <Icon name="trending-up" color={C.lime} size={13} />
                          <Text style={{ fontSize: 11, color: C.lime }}>
                            +12 за эту неделю
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.heroFooter}>
                      <Text style={s.heroFootText}>
                        Ваши данные — ваши правила
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Запустить демонстрационную проверку"
                        onPress={scan}
                        disabled={scanning}
                        style={s.scanButton}
                      >
                        <Icon
                          name={scanning ? "loader" : "maximize"}
                          size={15}
                        />
                        <Text style={s.scanText}>
                          {scanning ? "Проверяем…" : "Проверить"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={[s.quickCard, { flex: roomy ? 1 : undefined }]}>
                    <View style={s.spaceBetween}>
                      <View style={s.softIcon}>
                        <Icon name="eye-off" color={C.green} />
                      </View>
                      <Switch
                        accessibilityLabel="Режим приватности (демо)"
                        value={protection}
                        onValueChange={setProtection}
                        trackColor={{ false: "#DADFD3", true: C.lime }}
                        thumbColor={C.ink}
                      />
                    </View>
                    <Text style={s.quickTitle}>Режим приватности</Text>
                    <Text style={s.bodyCopy}>
                      Ограничивайте фоновый доступ к вашим личным данным.
                    </Text>
                    <View style={s.quickDivider} />
                    <View style={s.spaceBetween}>
                      <Badge
                        text={protection ? "Защита активна" : "Защита на паузе"}
                        warm={!protection}
                      />
                      <Icon name="shield" size={17} color={C.green} />
                    </View>
                    <Text style={[s.small, { marginTop: 13 }]}>
                      Предпросмотр настройки
                    </Text>
                  </View>
                </View>
                <View style={[s.stats, !roomy && { gap: 8 }]}>
                  {[
                    {
                      n: "24",
                      label: "Приложения",
                      icon: "layers",
                      sub: "в демо-профиле",
                    },
                    {
                      n: "128",
                      label: "Запросов",
                      icon: "activity",
                      sub: "за последние сутки",
                    },
                    {
                      n: "18",
                      label: "Ограничено",
                      icon: "shield",
                      sub: "фоновых обращений",
                    },
                  ].map((x, i) => (
                    <View key={x.label} style={[s.stat, i < 2 && s.statBorder]}>
                      <View style={s.spaceBetween}>
                        <Text style={s.statNumber}>{x.n}</Text>
                        {roomy && (
                          <Icon name={x.icon} color={C.muted} size={18} />
                        )}
                      </View>
                      <Text style={s.statLabel}>{x.label}</Text>
                      <Text style={[s.small, !roomy && { fontSize: 10 }]}>
                        {x.sub}
                      </Text>
                    </View>
                  ))}
                </View>
                <View
                  style={[s.lowerGrid, !roomy && { flexDirection: "column" }]}
                >
                  <View style={{ flex: 1.1 }}>
                    <Section title="Требует внимания" />
                    <Pressable
                      onPress={() => {
                        go("Приложения");
                        setFilter("С риском");
                      }}
                      style={s.attention}
                    >
                      <View style={s.spaceBetween}>
                        <View
                          style={[s.softIcon, { backgroundColor: "#F4E9D7" }]}
                        >
                          <Icon name="map-pin" color={C.orange} />
                        </View>
                        <Text style={s.attentionCount}>02</Text>
                      </View>
                      <Text style={s.attentionTitle}>
                        Лишний доступ к данным
                      </Text>
                      <Text style={s.bodyCopy}>
                        У двух приложений есть разрешения, которые можно
                        ограничить.
                      </Text>
                      <View style={[s.spaceBetween, { marginTop: 20 }]}>
                        <View style={s.inline}>
                          {apps
                            .filter((a) => a.risk)
                            .map((a) => (
                              <AppIcon key={a.id} app={a} />
                            ))}
                        </View>
                        <View style={s.inline}>
                          <Text style={s.link}>Проверить</Text>
                          <Icon name="arrow-up-right" size={17} />
                        </View>
                      </View>
                    </Pressable>
                    <Section title="Быстрый доступ" />
                    <View style={s.shortcuts}>
                      {Object.entries(permissionIcons)
                        .slice(0, 3)
                        .map(([name, icon]) => (
                          <Pressable
                            key={name}
                            accessibilityRole="button"
                            onPress={() => {
                              go("Приложения");
                              setFilter(name);
                            }}
                            style={s.shortcut}
                          >
                            <Icon name={icon} size={20} />
                            <Text style={s.shortcutLabel}>{name}</Text>
                          </Pressable>
                        ))}
                    </View>
                  </View>
                  <View style={{ flex: 1.3 }}>
                    <Section
                      title="Последняя активность"
                      action="Вся"
                      onPress={() => go("Активность")}
                    />
                    <View style={s.activityCard}>
                      <View style={s.spaceBetween}>
                        <Text style={s.eyebrow}>СЕГОДНЯ</Text>
                        <Text style={s.small}>Демо-история</Text>
                      </View>
                      {events.slice(0, 3).map(eventRow)}
                      <Pressable
                        onPress={() => go("Активность")}
                        style={s.activityFooter}
                      >
                        <Icon name="clock" size={15} color={C.muted} />
                        <Text style={s.small}>Вся история обращений</Text>
                        <Icon name="arrow-right" size={15} color={C.muted} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </>
            )}
            {tab === "Приложения" && (
              <>
                <View style={s.search}>
                  <Icon name="search" color={C.muted} />
                  <TextInput
                    accessibilityLabel="Поиск приложения"
                    placeholder="Найти приложение"
                    placeholderTextColor={C.muted}
                    value={query}
                    onChangeText={setQuery}
                    style={s.input}
                  />
                  {query !== "" && (
                    <Pressable
                      accessibilityLabel="Очистить поиск"
                      onPress={() => setQuery("")}
                    >
                      <Icon name="x" size={18} />
                    </Pressable>
                  )}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.filters}
                >
                  {["Все", "С риском", ...Object.keys(permissionIcons)].map(
                    (f) => (
                      <Pressable
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[s.filter, filter === f && s.filterActive]}
                      >
                        <Text
                          style={[
                            s.filterText,
                            filter === f && { color: "white" },
                          ]}
                        >
                          {f}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </ScrollView>
                <Section title="Разрешения приложений" />
                <Text style={[s.small, { marginBottom: 18 }]}>
                  Показано {visibleApps.length} из 6 демонстрационных приложений
                </Text>
                <View style={s.appGrid}>
                  {visibleApps.map((a) => (
                    <Pressable
                      key={a.id}
                      onPress={() => setSelected(a)}
                      style={[s.appCard, { width: roomy ? "48.8%" : "100%" }]}
                    >
                      <View style={s.spaceBetween}>
                        <AppIcon app={a} />
                        <Icon name="arrow-up-right" size={19} color={C.muted} />
                      </View>
                      <Text style={s.appName}>{a.name}</Text>
                      <Text style={s.small}>{a.category}</Text>
                      <View style={[s.inline, { marginVertical: 23 }]}>
                        {a.permissions.map((p) => (
                          <View key={p} style={s.permissionMini}>
                            <Icon
                              name={permissionIcons[p]}
                              size={16}
                              color={C.muted}
                            />
                          </View>
                        ))}
                      </View>
                      <View style={s.spaceBetween}>
                        <Badge
                          text={a.risk ? "Проверьте доступ" : "Всё в порядке"}
                          warm={a.risk}
                        />
                        <Text style={s.small}>
                          {a.permissions.length} разреш.
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                {visibleApps.length === 0 && (
                  <View style={s.empty}>
                    <Icon name="search" size={35} color={C.muted} />
                    <Text style={s.sectionTitle}>Ничего не найдено</Text>
                    <Text style={s.bodyCopy}>
                      Попробуйте другое название или фильтр.
                    </Text>
                    <Button
                      label="Сбросить поиск"
                      onPress={() => {
                        setQuery("");
                        setFilter("Все");
                      }}
                    />
                  </View>
                )}
              </>
            )}
            {tab === "Активность" && (
              <>
                <View style={s.summaryStrip}>
                  <View style={s.softIcon}>
                    <Icon name="activity" color={C.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sectionTitle}>
                      Прозрачность в каждом запросе
                    </Text>
                    <Text style={[s.bodyCopy, { marginTop: 5 }]}>
                      Пример того, как приложения обращаются к данным.
                    </Text>
                  </View>
                </View>
                <View style={s.filters}>
                  {["Все", "Ограничено", "Разрешено"].map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setFilter(f)}
                      style={[s.filter, filter === f && s.filterActive]}
                    >
                      <Text
                        style={[
                          s.filterText,
                          filter === f && { color: "white" },
                        ]}
                      >
                        {f}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Section title="Сегодня" />
                <View style={s.activityCard}>
                  {events
                    .filter(
                      (e) =>
                        filter === "Все" ||
                        (filter === "Ограничено" ? e.blocked : !e.blocked),
                    )
                    .map(eventRow)}
                </View>
                <View style={s.privacyNote}>
                  <Icon name="lock" size={16} color={C.muted} />
                  <Text style={[s.small, { flex: 1 }]}>
                    Это демонстрационная история, а не данные вашего устройства.
                  </Text>
                </View>
              </>
            )}
            {tab === "Настройки" && (
              <>
                <View style={s.profileCard}>
                  <View style={s.profileIcon}>
                    <Icon name="shield" size={34} color={C.lime} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sectionTitle}>Личное пространство</Text>
                    <Text style={[s.bodyCopy, { marginTop: 6 }]}>
                      Ваш профиль приватности
                    </Text>
                  </View>
                  <Badge text="Демо" />
                </View>
                <Section title="Предпочтения" />
                <View style={s.settingsCard}>
                  {[
                    {
                      icon: "eye-off",
                      title: "Режим приватности",
                      copy: "Ограничение фоновой активности",
                      value: protection,
                      set: setProtection,
                    },
                    {
                      icon: "bell",
                      title: "Уведомления",
                      copy: "Сообщать о новых обращениях",
                      value: notifications,
                      set: setNotifications,
                    },
                    {
                      icon: "lock",
                      title: "Блокировка приложения",
                      copy: "Демонстрация входа по биометрии",
                      value: biometric,
                      set: setBiometric,
                    },
                  ].map((x) => (
                    <View key={x.title} style={s.settingRow}>
                      <Icon name={x.icon} color={C.green} />
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text style={s.rowTitle}>{x.title}</Text>
                        <Text style={s.small}>{x.copy}</Text>
                      </View>
                      <Switch
                        accessibilityLabel={x.title}
                        value={x.value}
                        onValueChange={x.set}
                        trackColor={{ false: "#DADFD3", true: C.lime }}
                        thumbColor={C.ink}
                      />
                    </View>
                  ))}
                </View>
                <Section title="О приложении" />
                <View style={s.settingsCard}>
                  <Pressable onPress={() => setInfo(true)} style={s.settingRow}>
                    <Icon name="info" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle}>
                        VEIL — приватность устройства
                      </Text>
                      <Text style={[s.small, { marginTop: 6 }]}>
                        Версия 1.0.0 · Учебный проект
                      </Text>
                    </View>
                    <Icon name="chevron-right" />
                  </Pressable>
                </View>
                <View style={s.privacyNote}>
                  <Icon name="check-circle" size={17} color={C.green} />
                  <Text style={[s.bodyCopy, { flex: 1 }]}>
                    Прототип не собирает личные данные и не запрашивает доступ к
                    камере, микрофону или геолокации. Настройки действуют только
                    внутри демонстрации.
                  </Text>
                </View>
              </>
            )}
            <View style={s.pageFooter}>
              <Text style={s.footerBrand}>veil.</Text>
              <Text style={s.small}>Приватность начинается с вас.</Text>
              <Icon name="lock" size={13} color={C.muted} />
            </View>
          </ScrollView>
          {!desktop && (
            <View style={s.bottomNav}>
              {nav.map((n) => (
                <Pressable
                  key={n.name}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === n.name }}
                  onPress={() => go(n.name)}
                  style={s.bottomItem}
                >
                  <View
                    style={[
                      s.bottomIcon,
                      tab === n.name && { backgroundColor: C.lime },
                    ]}
                  >
                    <Icon
                      name={n.icon}
                      size={20}
                      color={tab === n.name ? C.ink : C.muted}
                    />
                  </View>
                  <Text
                    style={[
                      s.bottomLabel,
                      tab === n.name && { color: C.ink, fontWeight: "600" },
                    ]}
                  >
                    {n.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
      <Modal
        visible={selected !== null || info}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={s.modalBackdrop}>
          <Pressable
            accessibilityLabel="Закрыть окно"
            style={StyleSheet.absoluteFill}
            onPress={close}
          />
          <ScrollView style={s.modal} contentContainerStyle={{padding:28}} bounces={false}>
            <View style={s.spaceBetween}>
              {selected ? (
                <AppIcon app={selected} />
              ) : (
                <View style={s.brandIcon}>
                  <Icon name="shield" color={C.lime} />
                </View>
              )}
              <Pressable
                accessibilityLabel="Закрыть"
                onPress={close}
                style={s.circleButton}
              >
                <Icon name="x" />
              </Pressable>
            </View>
            <Text style={[s.h1, { fontSize: 28, marginTop: 22 }]}>
              {selected ? selected.name : "Приватность без сложностей."}
            </Text>
            <Text style={[s.bodyCopy, { marginTop: 8, marginBottom: 22 }]}>
              {selected
                ? "Управляйте разрешениями в демо-профиле."
                : "VEIL — визуальный прототип мобильного приложения для контроля приватности устройства."}
            </Text>
            {selected ? (
              <>
                {selected.permissions.map((p) => (
                  <View key={p} style={s.settingRow}>
                    <Icon name={permissionIcons[p]} />
                    <Text style={[s.rowTitle, { flex: 1 }]}>{p}</Text>
                    <Switch
                      accessibilityLabel={selected.name + ": " + p}
                      value={permissions[selected.id + p] ?? true}
                      onValueChange={(v) =>
                        setPermissions((prev) => ({
                          ...prev,
                          [selected.id + p]: v,
                        }))
                      }
                      trackColor={{ false: "#DADFD3", true: C.lime }}
                      thumbColor={C.ink}
                    />
                  </View>
                ))}
                <Text style={[s.small, { lineHeight: 20, marginVertical: 20 }]}>
                  Изменения не влияют на системные разрешения. Демо-настройки
                  сохраняются до перезапуска приложения.
                </Text>
                <Button
                  label="Готово"
                  icon="check"
                  onPress={() => {
                    close();
                    notify("Демо-настройки обновлены");
                  }}
                />
              </>
            ) : (
              <>
                <View style={s.infoBox}>
                  <Text style={s.bodyCopy}>
                    Все показатели, приложения и события — демонстрационные.
                    Проверка не сканирует устройство, а режим приватности не
                    включает реальную защиту.
                  </Text>
                </View>
                <Text style={[s.small, { marginVertical: 20 }]}>
                  React Native · Expo · TypeScript{"\n"}Дизайн и интерактивный
                  прототип · 2026
                </Text>
                <Button label="Понятно" icon="check" onPress={close} />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
      {notice !== "" && (
        <View accessibilityRole="alert" style={s.toast}>
          <Icon name="check-circle" color={C.lime} />
          <Text style={s.toastText}>{notice}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  shell: { flex: 1, flexDirection: "row" },
  main: { flex: 1, minWidth: 0 },
  inline: { flexDirection: "row", alignItems: "center", gap: 10 },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sidebar: {
    width: 236,
    backgroundColor: "#FCFDF9",
    borderRightWidth: 1,
    borderRightColor: C.line,
    padding: 24,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 9,
    marginBottom: 57,
  },
  brandIcon: {
    backgroundColor: C.ink,
    width: 39,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -2,
    color: C.ink,
  },
  sideCaption: {
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "600",
    color: C.muted,
    marginBottom: 19,
  },
  navItem: {
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
  },
  navActive: { backgroundColor: C.lime },
  navText: { fontSize: 14, fontWeight: "500", color: C.muted },
  navDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.ink,
    marginLeft: "auto",
  },
  sideCard: {
    padding: 19,
    backgroundColor: "#EFF3E8",
    borderRadius: 15,
    gap: 12,
    marginBottom: 26,
  },
  sideCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 23,
    color: C.ink,
  },
  sideCardCopy: { fontSize: 12, lineHeight: 20, color: C.muted },
  device: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 22,
  },
  deviceIcon: {
    width: 34,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF1EB",
    borderRadius: 10,
  },
  topbar: {
    height: 81,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  crumb: { fontSize: 12, color: C.ink },
  demo: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDE3D5",
  },
  demoText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: C.muted,
  },
  circleButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    backgroundColor: C.paper,
  },
  content: { padding: 40, maxWidth: 1320, width: "100%", alignSelf: "center" },
  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 29,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: "600",
    color: C.muted,
  },
  h1: {
    fontSize: 36,
    fontWeight: "600",
    letterSpacing: -1.2,
    color: C.ink,
    marginTop: 11,
  },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 10, lineHeight: 21 },
  small: { fontSize: 11, color: C.muted },
  dot: { height: 5, width: 5, borderRadius: 3 },
  heroRow: { flexDirection: "row", gap: 20 },
  hero: {
    backgroundColor: "#283423",
    borderRadius: 20,
    padding: 23,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroEyebrow: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: "#C0CDB6",
    fontWeight: "500",
  },
  heroBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
    marginVertical: 23,
  },
  gauge: {
    width: 154,
    height: 154,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeText: { position: "absolute", alignItems: "center" },
  score: {
    fontSize: 57,
    fontWeight: "500",
    letterSpacing: -3,
    color: "#F2F8EA",
  },
  scoreLabel: { fontSize: 11, color: "#ADBBA3" },
  heroTitle: {
    fontSize: 29,
    lineHeight: 34,
    color: "white",
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  heroCopy: { fontSize: 11, lineHeight: 18, color: "#AFBDA5", maxWidth: 220 },
  heroPill: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 5,
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 5,
    backgroundColor: "#3B4B2E",
  },
  heroFooter: {
    borderTopWidth: 1,
    borderTopColor: "#46513F",
    paddingTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  heroFootText: { fontSize: 10, color: "#AFBDA5", flex: 1 },
  scanButton: {
    backgroundColor: C.lime,
    borderRadius: 8,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  scanText: { fontSize: 11, fontWeight: "600", color: C.ink },
  quickCard: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    padding: 25,
    backgroundColor: C.paper,
    justifyContent: "center",
  },
  softIcon: {
    backgroundColor: C.pale,
    borderRadius: 12,
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: {
    fontSize: 21,
    fontWeight: "500",
    letterSpacing: -0.4,
    color: C.ink,
    marginTop: 25,
    marginBottom: 10,
  },
  bodyCopy: { fontSize: 12, lineHeight: 21, color: C.muted },
  quickDivider: { height: 1, backgroundColor: C.line, marginVertical: 22 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.pale,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 10, fontWeight: "500", color: C.green },
  stats: {
    flexDirection: "row",
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingVertical: 22,
    marginTop: 20,
  },
  stat: { flex: 1, paddingHorizontal: 20, gap: 6 },
  statBorder: { borderRightWidth: 1, borderRightColor: C.line },
  statNumber: {
    fontSize: 30,
    fontWeight: "500",
    letterSpacing: -1,
    color: C.ink,
  },
  statLabel: { fontSize: 12, fontWeight: "500", color: C.ink },
  lowerGrid: { flexDirection: "row", gap: 24, marginTop: 8 },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: C.ink,
  },
  link: { fontSize: 11, fontWeight: "600", color: C.ink },
  attention: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F5F0E5",
    borderWidth: 1,
    borderColor: "#EAE2D3",
  },
  attentionCount: {
    fontSize: 28,
    fontWeight: "400",
    color: "#B9A98C",
    letterSpacing: -1,
  },
  attentionTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: C.ink,
    marginTop: 17,
    marginBottom: 8,
  },
  appIcon: {
    height: 40,
    width: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  shortcuts: { flexDirection: "row", gap: 10 },
  shortcut: {
    flex: 1,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 18,
    gap: 12,
  },
  shortcutLabel: { fontSize: 10, color: C.ink },
  activityCard: {
    backgroundColor: C.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 20,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  eventIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 12, fontWeight: "600", color: C.ink },
  time: { fontSize: 10, color: C.muted },
  activityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 19,
    paddingBottom: 2,
  },
  pageFooter: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#A9B09F",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FCFDF9",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 9,
    paddingBottom: 9,
  },
  bottomItem: { flex: 1, alignItems: "center", gap: 5 },
  bottomIcon: { paddingVertical: 7, paddingHorizontal: 21, borderRadius: 16 },
  bottomLabel: { fontSize: 10, color: C.muted },
  search: {
    backgroundColor: C.paper,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: { flex: 1, paddingVertical: 16, fontSize: 14, color: C.ink },
  filters: { flexDirection: "row", gap: 8, paddingVertical: 20 },
  filter: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 24,
    backgroundColor: C.paper,
  },
  filterActive: { backgroundColor: C.ink, borderColor: C.ink },
  filterText: { fontSize: 12, color: C.muted },
  appGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  appCard: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 22,
  },
  appName: {
    fontSize: 21,
    fontWeight: "500",
    color: C.ink,
    marginTop: 20,
    marginBottom: 5,
  },
  permissionMini: { backgroundColor: C.bg, padding: 8, borderRadius: 8 },
  empty: { alignItems: "center", padding: 40, gap: 20 },
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 23,
    backgroundColor: "#EAF0E1",
    borderRadius: 16,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 28,
    paddingHorizontal: 4,
  },
  profileCard: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  profileIcon: {
    width: 64,
    height: 68,
    backgroundColor: C.ink,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsCard: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 22,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  button: {
    backgroundColor: C.ink,
    borderRadius: 10,
    paddingHorizontal: 19,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  buttonText: { fontSize: 13, fontWeight: "600", color: "white" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20,30,16,.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modal: {
    backgroundColor: C.paper,
    borderRadius: 23,
    width: "100%",
    maxWidth: 460,
    maxHeight: '90%',
    flexGrow: 0,
  },
  infoBox: { padding: 18, backgroundColor: C.bg, borderRadius: 12 },
  toast: {
    position: "absolute",
    bottom: 105,
    alignSelf: "center",
    maxWidth: 420,
    marginHorizontal: 20,
    backgroundColor: C.ink,
    padding: 18,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toastText: { fontSize: 12, lineHeight: 19, color: "white", flexShrink: 1 },
});
